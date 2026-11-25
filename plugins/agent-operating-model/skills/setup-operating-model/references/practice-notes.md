# Practice notes

Notes from running a generated model day to day. They depend on the host app or on the project's pull-request flow, so they are not written into the protocol's rules; add the ones that fit to the closing report's next steps. The one exception is the hand-back script, which Step 5 copies into the protocol.

## A lead hands back while a resumed child still runs

Claude Code documents that a child resumed with `SendMessage` runs in the background, and that in an interactive session the agent that resumed it waits for its result. In practice, a host app can remind a lead to hand back while such a child still runs, and leads then handed back early, leaving the child working alone (observed in one project's agent review: most early hand-backs followed that reminder, and almost all of them involved a resumed child). The protocol's `BLOCKED: waiting for <child id>` status and the "one blocking command, no polling" rule are the answer; this note is the evidence.

## Main-session rotation in a desktop app

Some apps start a new session from a card that can end up nested under the session that created it. The protocol says the next main session is a new top-level session; in such an app, the incoming session checks where it sits and moves itself to the top level before taking over. The incoming half carries the rotation: it reads the handoff, confirms the outgoing session is closed or archived, and only then talks to the owner.

## The hand-back script

The protocol's § Session hygiene holds this script (Step 5 writes it there, with the project's folder filled in): the main session runs it at every lead hand-back. It depends on Claude Code's transcript layout (`~/.claude/projects/<project-dir>/<session>.jsonl`, the session's subagents under `<session>/subagents/` with a `.meta.json` naming `parentAgentId`), checked in one project; re-check it after a Claude Code update. `<project-dir>` is the folder Claude Code uses for the repo there (its absolute path with `/` replaced by `-`). Size counts only the `user` and `assistant` records, image data stripped: the app's own records add megabytes to every session whatever its length. A child that wrote in the last 2 minutes still runs.

```sh
python3 - <project-dir> <session> [<lead-agent-id>] <<'EOF'
import json,glob,os,re,sys,time
LIMIT=5e6  # rotation threshold in bytes of conversation (default — tune)
base=os.path.expanduser(f'~/.claude/projects/{sys.argv[1]}/{sys.argv[2]}')
lead=sys.argv[3] if len(sys.argv)>3 else None
def size(p):
    b=0;ids=set()
    for l in open(p):
        try: d=json.loads(l)
        except ValueError: continue
        if d.get('type') in ('user','assistant'): b+=len(re.sub(r'"data":"[A-Za-z0-9+/=]{200,}"','',l).encode())
        m=d.get('message') or {}
        if m.get('role')=='assistant' and m.get('id'): ids.add(m['id'])
    return f'{b/1e6:.1f} MB of conversation, {len(ids)} turns'+(' -> rotate at the next clean point' if b>LIMIT else '')
if lead:
    for m in glob.glob(f'{base}/subagents/*.meta.json'):
        if json.load(open(m)).get('parentAgentId')!=lead: continue
        age=time.time()-os.path.getmtime(m.replace('.meta.json','.jsonl'))
        print(('WRITING ' if age<120 else 'idle ')+os.path.basename(m)[6:-10], int(age),'s')
    print('lead:', size(f'{base}/subagents/agent-{lead}.jsonl'))
print('main session:', size(f'{base}.jsonl'))
EOF
```

## A hook that keeps the main session from browsing (owner step)

Offer this in the closing report as an owner step, never written by the skill: `.claude/settings.json` is the owner's. It denies browser and web tools to the session whose hook input has no `agent_id`, so the main session hands that work to an agent. **Not verified** that it blocks only the main session; the owner tries one browser call from the main session and one from an agent after adding it. It needs `jq`; adjust the matcher to the browser tools the project has.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__claude-in-chrome__.*|mcp__computer-use__.*|WebSearch|WebFetch",
        "hooks": [
          {
            "type": "command",
            "command": "jq -e 'has(\"agent_id\")' >/dev/null && exit 0; printf '%s' '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Main session: delegate this to an agent (docs/OPERATING-MODEL.md).\"}}'"
          }
        ]
      }
    ]
  }
}
```

## Watch a ready pull request until it merges

For projects where the owner merges pull requests: when a PR becomes ready for the owner, the session that made it ready arms a watch that ends on the merge. A new or resumed session lists the open PRs and re-arms their watches, since a watch dies with its session.

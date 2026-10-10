#!/usr/bin/env python3
"""Static, conservative name-level dependency map; SQL replay validates executable ordering."""
import argparse
import hashlib
import json
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
files = sorted((root / 'supabase/migrations').glob('*.sql'))
records = {}
origins = {}
for file in files:
    version = int(file.name.split('_')[0][-4:])
    sql = re.sub(r'/\*.*?\*/|--[^\n]*', '', file.read_text(), flags=re.S)
    created = set(re.findall(r'create\s+(?:or\s+replace\s+)?(?:table\s+(?:if\s+not\s+exists\s+)?|function\s+|view\s+)(public\.[a-z_][a-z_0-9]*)', sql, re.I))
    for index in re.findall(r'create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z_0-9]*)\s+on\s+public\.', sql, re.I):
        created.add('public.' + index.lower())
    for obj in created:
        origins.setdefault(obj.lower(), version)
    refs = set(x.lower() for x in re.findall(r'\b((?:public|auth|storage)\.[a-z_][a-z_0-9]*)', sql, re.I))
    records[version] = {'version': version, 'file': file.name, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'introduced_or_replaced': sorted(created), 'references': sorted(refs)}
for v, record in records.items():
    deps = {}
    unresolved = []
    for obj in record['references']:
        owner = origins.get(obj)
        if owner is not None and owner < v:
            deps.setdefault(owner, []).append(obj)
        elif owner is None and obj.startswith('public.'):
            unresolved.append(obj)
    record['earlier_dependencies'] = {str(k): val for k, val in sorted(deps.items())}
    record['unresolved_public_names'] = unresolved
    record['forward_definitions'] = [x for x in record['references'] if origins.get(x, v) > v]
    record['platform_references'] = [x for x in record['references'] if x.startswith(('auth.', 'storage.'))]
result = {'method': 'Conservative qualified-name extraction, not a SQL parser: function overloads, strings and policy/trigger/index names require catalog/manual review; edges point to first definition, not latest replacement. Missing migration behavior is unknown.', 'migrations': [records.get(v, {'version': v, 'status': 'MISSING', 'dependencies': 'UNKNOWN'}) for v in range(1,61)]}
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
args = parser.parse_args()
Path(args.output).write_text(json.dumps(result,indent=2)+'\n')

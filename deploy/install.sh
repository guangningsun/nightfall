#!/bin/bash
set -euo pipefail
root=/opt/nightfall-coop
release="$root/releases/0.6.0"
# First installation only. Upgrades must use a new version directory.
test ! -e "$root/current"
test ! -e /etc/systemd/system/nightfall-coop.service
if ss -lntH | awk '{print $4}' | grep -q ':10000$'; then echo 'Port 10000 occupied'; exit 1; fi
mkdir -p "$release" "$root/backups"
sha256sum /opt/nightfall-survivor/dist/index.html /opt/nightfall-survivor/dist/game.js > "$root/backups/web-before.sha256"
cp -p /etc/nginx/nginx.conf "$root/backups/nginx-before-0.6.0.conf"
tar -xzf /tmp/nightfall-coop-0.6.0.tar.gz -C "$release"
ln -s "$release/server" "$root/current"
cp "$release/deploy/nginx-location.conf" "$root/nginx-location.conf"
cp "$release/deploy/nightfall-coop.service" /etc/systemd/system/nightfall-coop.service
rollback(){
 cp -p "$root/backups/nginx-before-0.6.0.conf" /etc/nginx/nginx.conf
 nginx -t && systemctl reload nginx || true
 systemctl disable --now nightfall-coop || true
 echo 'Install failed. Nginx restored; new coop service stopped.' >&2
}
trap rollback ERR
systemctl daemon-reload
systemctl enable --now nightfall-coop
for i in 1 2 3 4 5; do curl -fsS http://127.0.0.1:10000/health && break || sleep 1; done
curl -fsS http://127.0.0.1:10000/health
python3 - <<'PY'
from pathlib import Path
p=Path('/etc/nginx/nginx.conf');s=p.read_text()
assert '/nightfall-coop/' not in s and 'include /opt/nightfall-coop/nginx-location.conf;' not in s
start=s.index('listen       443 ssl http2 default_server;')
pos=s.index('server_name  brilliantlife.com.cn;',start)+len('server_name  brilliantlife.com.cn;')
s=s[:pos]+'\n        include /opt/nightfall-coop/nginx-location.conf;'+s[pos:]
p.write_text(s)
PY
nginx -t
systemctl reload nginx
for i in 1 2 3 4 5; do
 if curl --fail --silent --show-error --resolve brilliantlife.com.cn:443:127.0.0.1 https://brilliantlife.com.cn/nightfall-coop/health | python3 -c 'import json,sys; v=json.load(sys.stdin); assert v["ok"] and v["version"]=="0.6.0"'; then break; fi
 sleep 1
done
curl --fail --silent --show-error --resolve brilliantlife.com.cn:443:127.0.0.1 https://brilliantlife.com.cn/nightfall-coop/health | python3 -c 'import json,sys; v=json.load(sys.stdin); assert v["ok"] and v["version"]=="0.6.0"'
sha256sum -c "$root/backups/web-before.sha256"
curl -fsS -o /dev/null http://127.0.0.1:9999/
trap - ERR
echo 'Nightfall coop v0.6.0 installed; existing web files unchanged.'

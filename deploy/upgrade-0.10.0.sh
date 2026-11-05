#!/bin/bash
set -euo pipefail
root=/opt/nightfall-coop
release="$root/releases/0.10.0"
test -L "$root/current"
test ! -e "$release"
curl -fsS http://127.0.0.1:10000/health | python3 -c 'import json,sys; assert json.load(sys.stdin)["rooms"]==0, "Active rooms: defer upgrade"'
previous=$(readlink "$root/current")
backup="$root/backups/nightfall-coop-before-0.10.0.service"
cp -p /etc/systemd/system/nightfall-coop.service "$backup"
printf '%s\n' "$previous" > "$root/backups/release-before-0.10.0.txt"
mkdir -p "$release"
tar -xzf /tmp/nightfall-coop-0.10.0.tar.gz -C "$release"
rollback(){
 ln -sfn "$previous" "$root/current"
 cp -p "$backup" /etc/systemd/system/nightfall-coop.service
 systemctl daemon-reload
 systemctl restart nightfall-coop
 echo 'Rolled back coop code; persistent player data retained.' >&2
}
trap rollback ERR
ln -sfn "$release/server" "$root/current"
cp "$release/deploy/nightfall-coop.service" /etc/systemd/system/nightfall-coop.service
systemctl daemon-reload
systemctl restart nightfall-coop
for i in 1 2 3 4 5; do
 if curl -fsS http://127.0.0.1:10000/health | python3 -c 'import json,sys; assert json.load(sys.stdin)["version"]=="0.10.0"'; then break; fi
 sleep 1
done
curl -fsS http://127.0.0.1:10000/health | python3 -c 'import json,sys; assert json.load(sys.stdin)["version"]=="0.10.0"'
sha256sum -c "$root/backups/web-before.sha256"
systemctl is-active nightfall-coop nightfall-survivor nginx
trap - ERR
echo 'Coop v0.10.0 deployed. Persistence: systemd StateDirectory nightfall-coop.'

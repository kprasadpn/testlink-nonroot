#!/bin/bash -e

. /opt/bitnami/base/functions
. /opt/bitnami/base/helpers

print_welcome_page
if ! whoami &> /dev/null; then
   if [ -w /etc/passwd ]; then
   echo "${USER_NAME:-default}:x:$(id -u):0:${USER_NAME:-default} user:${HOME}:/sbin/nologin" >> /etc/passwd
   fi
fi

if [[ "$1" == "nami" && "$2" == "start" ]] || [[ "$1" == "/init.sh" ]]; then
    . /testlink-init.sh
    nami_initialize apache php mysql-client testlink
    info "Starting gosu... "
    . /post-init.sh
fi

exec tini -- "$@"

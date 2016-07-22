#!/bin/sh

export PHP_FCGI_CHILDREN=0
export PHP_FCGI_MAX_REQUESTS=0

PHPRC=/home/`id -gn`/cgi-bin/php5.ini
export PHPRC

exec /usr/bin/php-cgi5

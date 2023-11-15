curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
     -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9" \
     -H "Accept-Encoding: gzip, deflate, br" \
     -H "Accept-Language: es-US,es-419;q=0.9,es;q=0.8,pt;q=0.7,en-US;q=0.6,en;q=0.5" \
     -H "Cache-Control: max-age=0" \
     -H "Connection: keep-alive" \
     -H "Sec-Fetch-Dest: document" \
     -H "Sec-Fetch-Mode: navigate" \
     -H "Sec-Fetch-Site: same-origin" \
     -H "Sec-Fetch-User: ?1" \
     -H "Upgrade-Insecure-Requests: 1" \
     -o "/tmp/curloutput.txt" \
     -s -w "%{time_starttransfer}\n" \
     "http://localhost:8305/"




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
     "http://localhost:8305/local/tai-gym/LOC384950001"

     #"http://localhost:8305/local/tdh/W0BPzC51Cm9NAqsYhOEplQHE"
     #"http://localhost:8305/local/buffet-bien-nuestro/LOC759270001"
     #"http://localhost:8305/local/tdh/W0BPzC51Cm9NAqsYhOEplQHE"
     #"http://localhost:8305/local/peluqueria-el-circo/LOC579940001"




# TIMING
#   curl comercio 1.0 - 0.15
#        comercio 2.0 - 0.08
#
#   gmpiid5   - 24-43
#
#   gmpiid5.2 - 32-60
#
#   gmpiid6   - 70-80 
#
#   gmpiid7   - 20-25
#



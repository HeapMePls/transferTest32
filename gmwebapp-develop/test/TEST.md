
## TEST API

https://www.tingelmar.com/com/app/api.php?piid=W0BPzC51Cm9NAqsYhOEplQHE&opts=GQ&html=1&prm=1&rel=1&subs=1&id=web1122&action=gmpiid7
https://www.tingelmar.com/com/app/api.php?piid=507840001&opts=GQ&html=1&prm=1&rel=1&subs=1&id=web1122&action=gmpiid7
https://www.tingelmar.com/com/app/api.php?piid=LOC507840001&opts=GQ&html=1&prm=1&rel=1&subs=1&id=web1122&action=gmpiid7

## TEST PERFIL

### Variantes de acceso

http://localhost:8305/local/tdh/W0BPzC51Cm9NAqsYhOEplQHE
http://localhost:8305/local/tdh/LOC507840001
http://localhost:8305/local/tdh/507840001

http://localhost:8305/local/pinturas-7-colores/xVGcg8QIOZ9gKWMqYa3fczQU
http://localhost:8305/local/pinturas-y-colores/LOC430600001
http://localhost:8305/local/pinturas-y-colores/430600001


### No existe el negocio
http://localhost:8305/local/619-high-detailing/IMckFpCEv7SdEE47ybpXSjXl
http://localhost:8305/local/619-high-detailing/marker-shadow.png

### Esta borrado
http://localhost:8305/local/619-high-detailing/LOC1260001


SELECT lp.productNumber, lp.productName, le.localId, lf.storeRetailerNumber, lf.storeNumber
  FROM locprods AS lp
        JOIN localesExpandido AS le ON (le.id = lp.storeExpandedId)
        JOIN localesFiltrado_Full AS lf ON (lf.id = le.localId) 
  WHERE lp.pid IN (0x20C724169084BFB49D104E3BC9BA574A35E5)

### 

## INSTALL

ROLLBACK
cp gmpiid6-backup2.inc.php gmpiid6.inc.php


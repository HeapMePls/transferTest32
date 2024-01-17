# Guía Móvil 1122

## PRE-INSTALACION

1. Instalar PHP 7
2. Instalar PHP composer 1.9.2
3. Instalar node 10
4. Instalar Redis Server 5

## INSTALACION

1. Composer para Symfony
   1. `composer install`
2. Paquetes node para compilacion
   1. Renombrar `_package.json` a `package.json` (se deja con '_' para que no se procese en produccion durante las actualizaciones)
   2. `npm install`
   3. Renombrar `package.json` a `_package.json`
3. Configurar Apache local
   1. Usar de ejemplo el archivo apache.conf del raiz del proyecto

## PREPARAR PARA DEPLOY

Para preparar para deploy, seguir estos pasos y probar la version de produccion localmente.  
Para que funcione la configuracion de produccion como local, hay que cambiar la configuracion de redis y copiar de `dev.ini` (o `dev_bi.ini`) a `production.ini` (o `production_bi.ini`).  
**IMPORTANTE**: No olvidar volver atras este cambio para que en produccion no quede configurado como local el Redis o no va a levantar el sitio

1. Completar CHANGELOG.md con detalles de release
2. En app/bootstrap.php cambiar version:

   $twig->addGlobal('assetVersion', '3.0.0');

   y en _package.json poner la misma version

3. Compilar

   - Verificar  
     - `/gulpfile.js:83`  -> accessToken (sea el mismo que el de la cookie `_gmwa_ut` de localhost)
     - `/gulpfile.js:84`  -> deviceToken (sea el mismo que el de la cookie `_gmwa_dt` de localhost)
     - `/gulpfile.js:238` -> la url de la pelicula es valida
     - `/app/config/production` -> Configuracion de Redis de produccion
     - `/_package.json` -> asegurarse que el package.json no quede disponible

   - Verificar el BRAND al comienzo del gulpfile.js para que sea el correcto

   - Compilar
     ~~~
     gulp buildDyn
     ~~~

   - Limpiar cache (si algun cambio no se refleja)
     ~~~
     sudo rm -rf app/cache/*
     ~~~

4. Probar de acceder al puerto local de la configuracion del sitio en produccion


## Dependencias Javascript

 - https://github.com/aFarkas/lazysizes


## Redis

### Comandos

Ver claves:  
~~~
redis-cli --scan --pattern '*'
redis-cli KEYS "*gmquery*"
~~~

Borrar ciertas claves:  
~~~
redis-cli KEYS "*gmquery*" | xargs redis-cli DEL
~~~

# SEGURIDAD

## CONTROL DE LOGIN Y REGISTRO

1. CSRF - You need to have protection in place to prevent cross site request forgery - or requests to login, signup, or other actions from other sites. This can be used to trick users into performing actions they didn't intend to.

2. CAPTCHA on signup - It's often recommended to use a CAPTCHA on your sigh-up form to reduce automated signups. How important this is depends on your threat model.

3. Email Confirmation - You need to make sure that you verify a user's email address as part of the sign-up process (I'd suggest not letting them login until it's confirmed). You'll need to have this for use in password resets.

4. Bruteforce protection - You need to protect against an attacker bruteforcing user accounts. There are various ways to do this, locking accounts (which can be used as a DoS attack by locking out large number of users), limiting failed attempts from a given IP (either via ban, or additional CAPTCHA). There are pros and cons to each method, but it's important that you have some form of protection in place.

5. SQLInject


# Tests

### Resolucion de no encontrados

 - Caso Error 153 (PID_NOT_FOUND) sin match
   Al dar error 153, se busca por nombre y si no matchea perfecto, se redirecciona a una busqueda por el nombre del local

 ```
 /local/don-lucas/PIDRShlxwyHQ3VbsZ62NFti9hOQ
 ```

 - CASO Error 153 (PID_NOT_FOUND) con match
   Al dar error 153, se busca por nombre y si matchea perfecto, se redirecciona (internamente) al encontrado.

 ```
 /local/el-recanto/PIDA3ticlWQOd6HAkX97y_QfTQr
 ```

 - Caso marcado como borrado (sin match)
   Al tener marcado como local borrado, se busca por nombre y si no matchea perfecto, se redirecciona (internamente) a una busqueda por el rubro y la zona del local anterior, agregando un mensaje bien arriba de la lista indicando que el local ya no esta en disponible en nuestra base y que le mostramos similares.

 ```
 /local/panaderia-la-italiana/LOC302300001
 ```

 - Caso marcado como borrado (con match)
   Al encontrar uno que matchea, se redireccion (internamente) al nuevo LOCxxxxxxyyyy.  
   En la URL queda el LOC viejo, pero en el canonical queda el LOC nuevo.

```
/local/credincoop-canelones/LOC311740001
```

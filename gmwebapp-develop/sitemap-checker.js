const fs = require('fs');
const libxmljs = require('libxmljs');
const request = require('request');

var baseDomain = 'http://localhost:8305';
var baseUrl = baseDomain+'/smap';

(async () => {
  //
  // Check working directory
  //
  if (!fs.existsSync('/tmp/1122sm-test')){
    fs.mkdirSync('/tmp/1122sm-test');
  }

  //
  // Check Schemas
  //
  downloadSchemas = async () => {
    return new Promise((resolve, reject) => {
      request('http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd', function (error, response, body) {
        if (error){
          console.error('Could not download Schemas!');
          reject(error);
        }else{
          if (response && response.statusCode){
            if (response.statusCode == 200){
              console.log(body);
              const buffer = Buffer.from(body, 'utf8');
              fs.writeFileSync('/tmp/1122sm-test/schemas/sitemap.xsd', buffer);
              console.log('Schema downloaded OK');
              resolve();
            }else{
              console.error('Status code '+response.statusCode+' when downloading schemas');
              reject (new Error('Status code '+response.statusCode+' when downloading schemas'))
            }
          }else{
            console.error('Invalid http response');
            reject (new Error('Invalid HTTP response when downloading schemas'))
          }
        }
      });
    });
  }
  if (!fs.existsSync('/tmp/1122sm-test/schemas')){
    console.info('Downloading schemas...')
    fs.mkdirSync('/tmp/1122sm-test/schemas');
    await downloadSchemas();
    console.info('Schemas downloaded OK')
  }else{
    console.info('Schemas are here');
  }


  //
  // Sitemap methods
  //
  if (!fs.existsSync('/tmp/1122sm-test/sitemaps')){
    fs.mkdirSync('/tmp/1122sm-test/sitemaps');
  }
  downloadSitemapRoot = async () => {
    return new Promise((resolve, reject) => {
      console.info('Downloading root sitemap...');
      request(baseUrl, function (error, response, body) {
        if (error){
          console.error('Could not download root sitemap!');
          reject(error);
        }else{
          if (response && response.statusCode){
            if (response.statusCode == 200){
              console.info('Root sitemap downloaded successfully.');
              const buffer = Buffer.from(body, 'utf8');
              fs.writeFileSync('/tmp/1122sm-test/sitemaps/root.xml', buffer);

              // console.info('Checking valid XML ...');
               const sitemap = fs.readFileSync('/tmp/1122sm-test/sitemaps/root.xml');
              // const schema = fs.readFileSync('/tmp/1122sm-test/schemas/sitemap.xsd');
               var sitemapDoc = libxmljs.parseXml(sitemap);
              // const schemaDoc = libxmljs.parseXml(schema);
              // const isValid = sitemapDoc.validate(schemaDoc);
              // if (isValid){
              //   console.info('Root sitemap is valid.');
                 resolve(sitemapDoc);
              // }else{
              //   console.error('Found XML errors on root sitemap: ');
              //   console.error(sitemapDoc.validationErrors);
              //   reject(new Error('Root sitemap XML file is invalid!'));
              // }

            }else{
              reject (new Error('Status code '+esponse.statusCode+' when downloading root sitemap'))
            }
          }else{
            reject (new Error('Invalid HTTP response when downloading root sitemap'))
          }
        }
      });
    });
  }
  getSitemapCateg = (url) => {
    if (url.indexOf('smap/loc')>0) return 'locales';
    if (url.indexOf('smap/rz')>0)  return 'rubroZona';
    if (url.indexOf('smap/r')>0)   return 'rubros';
    if (url.indexOf('smap/z')>0)   return 'zonas';
    if (url.indexOf('smap/g')>0)   return 'gals';
    if (url.indexOf('smap/p')>0)   return 'promos';
    if (url.indexOf('smap/v')>0)   return 'videos';
    return null;
  }

  //downloadSitemap('http://localhost:8305/smap/loc/flores/07/-1/-1');
  // getSitemapCateg('http://localhost:8305/smap/loc/florida/08/-1/-1');
  // getSitemapCateg('http://localhost:8305/smap/rz/sarandi-del-yi/06421');

  downloadSitemap = async (url) => {
    return new Promise((resolve, reject) => {
      console.info('    Downloading sitemap '+url+' ...');
      request(url, function (error, response, body) {
        if (error){
          console.error('    Could not download sitemap at ' + url);
          reject(error);
        }else{
          if (response && response.statusCode){
            if (response.statusCode == 200){
              var filename = url.substr(url.indexOf('smap')+5).replace(/\//g,'-')+'.xml';
              var sitemapCateg = getSitemapCateg(url);
              var filePath = '/tmp/1122sm-test/sitemaps/'+sitemapCateg+'/'+filename;
              if (url == null){
                console.error('    Could not get sitemap categ for ' + url);
                reject(error);
              }else{
                // Create categ folder
                if (!fs.existsSync('/tmp/1122sm-test/sitemaps/'+sitemapCateg)){
                  fs.mkdirSync('/tmp/1122sm-test/sitemaps/'+sitemapCateg);
                }
                // Save File
                console.info('    Sitemap downloaded successfully, will save it to ' + filePath);
                var buffer = Buffer.from(body, 'utf8');
                fs.writeFileSync(filePath, buffer);
                var sitemap = fs.readFileSync(filePath);
                var sitemapDoc = libxmljs.parseXml(sitemap);
                // Count Urls
                let defNS = sitemapDoc.root().namespace().href(); 
                var sitemapUrls = sitemapDoc.root().find('xmlns:url', defNS);

                console.info('    Found ' + sitemapUrls.length + ' urls in ' + filename);
                resolve({
                  categ: sitemapCateg,
                  count: sitemapUrls.length
                });
              }
            }else{
              reject (new Error('Status code '+esponse.statusCode+' when downloading root sitemap'))
            }
          }else{
            reject (new Error('Invalid HTTP response when downloading root sitemap'))
          }
        }
      });
    });
  }
  processSitemapRoot = async (rootDoc) => {
    return new Promise( async (resolve, reject) => {
      var result = {
        sitemaps: 0,
        urls: {
          locales   : 0,
          rubroZona : 0,
          rubros    : 0,
          zonas     : 0,
          gals      : 0,
          promos    : 0,
          videos    : 0
        }
      }
      let defNS = rootDoc.root().namespace().href(); 
      var sitemapUrls = rootDoc.root().find('xmlns:sitemap/xmlns:loc', defNS);
      for(var i=0; i < sitemapUrls.length; i++){
        var sitemapUrl = sitemapUrls[i].text().replace('https','http');
        console.log('  Start processing sitemap ' + sitemapUrl);
        try{
          var sitemapResult = await downloadSitemap(sitemapUrl);
          result.sitemaps++;
          result.urls[sitemapResult.categ] += sitemapResult.count;
        }catch(e){
          console.error('  Error processing sitemap ('+sitemapUrl+'):', e);
        }
        console.log('  End processing sitemap.');
      }
      resolve(result);
    });
  }

  //
  // Main Processing
  //
  console.log('----------------------');
  console.log('Start processing Root sitemap...');
  var rootSitemapDoc = null;
  try{
    rootSitemapDoc = await downloadSitemapRoot();
  }catch(e){
    console.error('Exception catched on downloadSitemapRoot: ' + e);
    console.error(e.stack);
  }
  try{
    var results = await processSitemapRoot(rootSitemapDoc);
    console.log('Finished processing sitemap');
    console.log('---------------------------');
    console.log(JSON.stringify(results,null,2))
    console.log('---------------------------');
  }catch(e){
    console.error('Exception catched on processSitemapRoot: ' + e);
    console.error(e.stack);
  }
  console.log('Root sitemap OK');
})();
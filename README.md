WebGLCraft
==============

WebGL implementation of [Minecraft](http://www.minecraft.net/) written in [Coffeescript](http://jashkenas.github.com/coffee-script/).

Demo [here](http://danielribeiro.github.io/WebGLCraft/).

[![](http://metaphysicaldeveloper.files.wordpress.com/2011/12/screen-shot-2011-12-17-at-6-44-36-pm.png)](http://danielribeiro.github.io/WebGLCraft/)

You can read more about the development of this project [here](http://metaphysicaldeveloper.wordpress.com/2011/12/20/implementing-minecraft-in-webgl/)


Compiling
----

It requires Coffeescript 1.1.3+ (version 1.6.2+ for [source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)), and node.js 0.6+

To compile, run:

    cake c

The command above will also watch for any changes. If you just wanna compile the files, run:

    cake compile

If you wanna see the game locally, you need python, and you run 

    cake server

which simply runs


    python -m SimpleHTTPServer

enabling you to open the game on [http://localhost:8000/public/](http://localhost:8000/public/).


To run the tests, simply run:


    cake spec


The tests are powered by [Jasmine](http://pivotal.github.com/jasmine/), and can also be seen
on the browser (useful for debugging) by opening test/web_runner.html.

Coffeescript Source Maps
-----

Make sure you have the latest coffeescript running (see [this](https://github.com/jashkenas/coffee-script/issues/2835) issue). Your source map file should look like this:

```javascript
{
 "version": 3,
 "file": "collision.js",
 "sourceRoot": "..",
 "sources": [
   "lib/collision.coffee"
 ],
 "names": [],
 "mappings": ";AAAA;CAAA,CAAA,CAEI,CAFH,UAAD;CAEI,CAAuB,CAAA,CAAvB,KAAwB,YAAxB;CACI,CAAe,EAAA,CAAM,CAArB;CAAA,GAAA,WAAO;QAAP;CACA,CAAmB,CAAK,CAAL,EAAnB;CAAA,CAAO,EAAM,WAAN;QADP;CAEA,CAAO,EAAM,SAAN;CAHX,IAAuB;CAAvB,CAOmB,CAAA,CAAnB,CAAmB,IAAC,QAApB;CACI,SAAA,0BAAA;CAAA,EAAO,CAAP,EAAA,eAAA;CACA;CAAA,UAAA,gCAAA;yBAAA;CACI,CAAkC,CAAvB,CAAA,CAAU,GAArB;AAEoB,CAApB,GAAA,IAAA;CAAA,IAAA,YAAO;UAHX;CAAA,MADA;CAKA,GAAA,SAAO;CAbX,IAOmB;CATvB,GAAA;CAAA"
}
```


Meta
----

Created by Daniel Ribeiro. Not affiliated with Mojang. Minecraft is a trademark of [Mojang](http://mojang.com/).

Released under the MIT License: http://www.opensource.org/licenses/mit-license.php

http://github.com/danielribeiro/WebGLCraft

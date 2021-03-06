const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 3000;
const staticBasePath = './dist';

const extContentType = {
	'.ico': 'image/x-icon',
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.wav': 'audio/wav',
	'.mp3': 'audio/mpeg',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
	'.doc': 'application/msword'
};

const server = http.createServer((req, res) => {
	console.log(`${req.method} ${req.url}`);

	let {url} = req;
	/**
	 * By removing '.' and '..' from req.url, and then using the .resolve(), .normalize(), and .join() methods,
	 * we're able to restrict the user to only accessing files within the ./public directory. Even if you try
	 * to refer to a parent directory using .. you won't be able to access any parent directories outside of
	 * 'public', so our other data is safe.
	 */
	url = path.normalize(url).replace(/^(\.\.[\/\\])+/, ''); // safeSuffix

	// if (/\/$/.test(url)) {
	// 	url = `${url}index.html`;
	// }

	const ext = path.extname(url);
	if (!extContentType[ext] || extContentType[ext] === extContentType['.html'] ) {
		url = '/index.html';
		console.log(url);
	} else {
		res.setHeader('Content-type', extContentType[ext] || 'text/plain' );
		res.setHeader('it-is-nodejs', "yes" );
	}

	// const resolvedBase = path.resolve(staticBasePath);
	url = path.join(path.join(__dirname, './dist'), url);

	const stream = fs.createReadStream(url);
	stream.on('error', () => {
		console.log('ERROR', url);
		res.writeHead(404, 'Not Found');
		res.write('404: File Not Found!' + ' ' + url);
		res.end();
	});
	res.statusCode = 200;
	stream.pipe(res);
});

server.listen(port);

console.log(`Server listening on port ${port}`);

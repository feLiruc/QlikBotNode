module.exports = function (gulp, plugins) {
    return function () {	
        // configure nodemon
        plugins.livereload.listen();
        var stream = plugins.nodemon({
            script: './script.js',
            watch: [
                "./script.js"
            ],
            ext: 'js html css',
            port: 3000
        })
        stream
            .on('restart', function () {
                console.log('restarted!')
                gulp.src('server.js', {'allowEmpty':true})
                    .pipe(plugins.livereload())
                    .pipe(plugins.notify('Reloading page, please wait...'));
            })
            .on('crash', function() {
                console.error('Application has crashed!\n')
                stream.emit('restart', 10)  // restart the server in 10 seconds 
            })
    }
}
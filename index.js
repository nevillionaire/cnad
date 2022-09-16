"use strict"

const watch = require('node-watch');
const shell = require("shelljs");
const path = require('path');
const fs = require('fs');

const root = process.cwd()

 
/**
 * Cpanel Auto deployment for nodejs application
 */
class CNAD {

	/**
	 * path to node and npm
	 */
	static path = '';

	/**
	 * Is true if node and npm paths exist
	 */
	static npm_path_exist = false;

	/**
	 * path to deployment log file
	 */
	 static deployment_log = path.join(root, 'deployment.log');

	 /**
	 * path to restart file
	 */
	  static restart_file = path.join(root, 'tmp', 'restart.txt');

	/**Configure path to your npm and node
	 * @param {string} _COMMAND_PATH_
	 * path to node and npm
	 */
	static config (_COMMAND_PATH_ = '') {

		if(!_COMMAND_PATH_){
			CNAD.write_info("Path to npm in production is required");
			console.error("CNAD", "::::", "Path to npm in production is required")
			process.exit();
		}

		const command = process.env.NODE_ENV !== 'production' ? find_command('npm') : find_command(_COMMAND_PATH_ + "/bin/npm");

		if(command) {
			this.path = command;
			this.npm_path_exist = true; 
			return true;
		}

		return false;

		/**
		 * @param {string} command_path
		 */
		function find_command(command_path) {
			if(!shell.which(command_path)) {
				CNAD.write_info('npm not found in the specify path')
				return false;
			};
			return command_path;
		}
		
	}

	/**
	 * Sart auto deployment
	 */
	static start() {

		const path_exist = this.npm_path_exist;

		const command = this.path;
		
		const file = path.join(root, 'package.json');

		if(fs.existsSync(file)){

			watch(file, function(/** @type {String} */ _evt, /** @type {String} */ _name) {

				if (path_exist) {

					CNAD.write_info("installing dependencies");

					shell.exec(`${command} i`, {silent: true}, function(_code, stdout, stderr) {

						CNAD.write_info('installation completed');

						if(stderr) CNAD.write_log(stderr);
						if(stdout) CNAD.write_log(stdout);

						CNAD.restart_server();
						
					});
				}

				
			});

			return;
		}
	}

	/***
	 * Restart the server
	 */
	static restart_server(){

		const restart_file = CNAD.restart_file;

		if(!fs.existsSync(restart_file)) shell.mkdir(path.join(root, 'tmp'))

		shell.touch(restart_file);

		CNAD.write_info('Restarting server');
	}

	/**
	 * Watch for changes. 
	 * 
	 * if there is, then the server will restart
	 * @param {[]} restart_file_paths
	 */
	static watch(restart_file_paths){

		const npm_exist = this.npm_path_exist;

		restart_file_paths.forEach((file)=>{

			if(!fs.existsSync(file)) return shell.echo(`CNAD:: ${file} does not exist :: If it will exist in production environment you can ignore`);

			watch(file, function(/** @type {String} */ _evt, /** @type {String} */ _name) {

				if (npm_exist) {
					
					CNAD.restart_server();
				}
			});
		})
		
	}

	/**
	 * @param {string} message
	 */
	static write_log(message){
		const file = this.deployment_log
		const deploylog = shell.test('-e', file);
		if(!deploylog) shell.touch(file);
		const date = `[${new Date().toDateString()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
		shell.exec(`echo ================== >> ${file}`);
		shell.exec(`echo LOG DATE ::${date}:: >> ${file}`);
		shell.exec(`echo ================== >> ${file}`);

		fs.appendFileSync(file, message, 'utf8');

		shell.exec(`echo ================== >> ${file}`);
	}

	/**
	 * @param {string} message
	 */
	 static write_info(message){
		const file = this.deployment_log
		const deploylog = shell.test('-e', file);
		if(!deploylog) shell.touch(file);
		const date = `[${new Date().toDateString()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
		shell.exec(`echo ${date}:: ${message} >> ${file}`);
	}
 }

 module.exports = {
	config : CNAD.config,
	start : CNAD.start,
	watch : CNAD.watch
 }



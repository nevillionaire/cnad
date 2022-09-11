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
	static path_exist = false;

	/**
	 * path to deployment log file
	 */
	 static deployment_log = path.join(root, 'deployment.log');

	 /**
	 * path to deployment log file
	 */
	  static restart_file = path.join(root, 'tmp', 'restart.txt');

	/**
	 * Cpanel Auto deployment for nodejs application
	 * @param {string} _COMMAND_PATH_
	 * path to node and npm
	 */
	static config (_COMMAND_PATH_ = '') {

		if(!_COMMAND_PATH_){
			CNAD.write_log("Path to npm in production is required");
			console.error("CNAD", "::::", "Path to npm in production is required")
			process.exit();
		}

		const command = process.env.NODE_ENV !== 'production' ? find_command('npm') : find_command(_COMMAND_PATH_ + "/bin/npm");

		if(command) {
			this.path = command;
			this.path_exist = true; 
			return true;
		}

		return false;

		/**
		 * @param {string} command_path
		 */
		function find_command(command_path) {
			if(!shell.which(command_path)) {
				CNAD.write_log('npm not found in the specify path')
				return false;
			};
			return command_path;
		}
		
	}

	/**
	 * Sart auto deployment
	 */
	static start() {

		const path_exist = this.path_exist;

		const command = this.path;
		
		const file = path.join(root, 'package.json');

		if(fs.existsSync(file)){

			watch(file, function(/** @type {String} */ _evt, /** @type {String} */ _name) {

				if (path_exist) {

					CNAD.write_log("installing dependencies");

					shell.exec(`${command} i`, function(_code, _stdout, stderr) {

						if(stderr) {
							CNAD.write_log(stderr);
						}

						const restart_file = CNAD.restart_file;

						shell.touch(restart_file);

						CNAD.write_log('Restarting server');
						
					});
				}

				
			});

			return;
		}
	}

	/**
	 * @param {string} message
	 */
	static write_log(message){
		const file = this.deployment_log
		const deploylog = shell.test('-e', file);
		if(!deploylog) shell.touch(file);
		const date = `[${new Date().toDateString()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}]`
		shell.exec(`echo ${date}:: ${message} >> ${file}`);
	}
 }

 module.exports = {
	config : CNAD.config,
	start : CNAD.start
 }



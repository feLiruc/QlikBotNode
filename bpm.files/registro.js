//
// filename: 'registro.js'
// creator: 'Felipe Israel Marinho'
// email: 'felipe.marinho@bridsolucoes.com.br'
//

var mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rootCAT@',
  database: 'db_agrobot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

module.exports = {
	registrarUsuario: async (user) => {

		const usuario = {
			usuario_telegram: user,
			ativo: 0,
			tipoacesso: '?',
			modified: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
			created: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
		}

		const result = await promisePool.query("INSERT INTO usuarios SET ?;", usuario);
		return result;
	},
	desabilitarUsuario: async (user) => {

		usuario = {
			usuario_telegram: user
		}

		const [rows, fields] = await promisePool.query("SELECT id FROM usuarios WHERE ? LIMIT 1;", usuario);
		
		acesso = {
			usuario_id: rows[0]['id']
		}

		/// Relacionamentos
		const resultAcessos = await promisePool.query("UPDATE `acessos` SET ativo = 0 WHERE ?;", acesso);
		const resultRestricoes = await promisePool.query("UPDATE `restricoes` SET ativo = 0 WHERE ?;", acesso);
		/// END Relacionamentos

		/// Usuario
		const resultUsuarios = await promisePool.query("UPDATE `usuarios` SET ativo = 0 WHERE ?;", usuario);
		/// END Usuario

		return true;

	}
}
//
// filename: 'acesso.js'
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
	usuarioRegistrado: async (username) => {
		const [rows, fields] = await promisePool.query(`
      SELECT 
        U.usuario_telegram    AS UsuarioTelegram, 
        U.ativo               AS UsuarioAtivo, 
        U.tipoacesso          AS UsuarioTipoAcesso
      FROM usuarios U
      WHERE 
        U.usuario_telegram = '${username}';`);
		return rows;
	},
  getAcessos: async (username) => {
    const [rows, fields] = await promisePool.query(`
      SELECT
        A.usuariosense          AS AcessosUsuarioSense, 
        A.ativo                 AS AcessosAtivo, 
        M.descricao             AS ModulosDescricao, 
        M.appid               AS ModuloAPPID, 
        U.usuario_telegram    AS UsuariosTelegram, 
        U.ativo               AS UsuariosAtivo, 
        U.tipoacesso          AS UsuariosTipoacesso 
      FROM 
        acessos A 
        LEFT JOIN modulos M ON M.id = (A.modulo_id) 
        LEFT JOIN usuarios U ON U.id = (A.usuario_id) 
      WHERE  
        U.usuario_telegram = '${username}' AND
        A.ativo = 1 AND
        U.ativo = 1;
    `);
    return rows;
  },
  getRestricoes: async (username) => {
    const [rows, fields] = await promisePool.query(`
      SELECT
        R.campo                 AS RestricoesCampo, 
        R.valor                 AS RestricoesValor, 
        M.descricao             AS ModulosDescricao, 
        M.appid               AS ModuloAPPID, 
        U.usuario_telegram    AS UsuariosTelegram, 
        U.ativo               AS UsuariosAtivo, 
        U.tipoacesso          AS UsuariosTipoacesso 
      FROM 
        restricoes R 
        LEFT JOIN modulos M ON M.id = (R.modulo_id) 
        LEFT JOIN usuarios U ON U.id = (R.usuario_id) 
      WHERE  
        U.usuario_telegram = '${username}' AND
        R.ativo = 1 AND
        U.ativo = 1;
    `);
    return rows;
  },
  criarApp: (qvf, dados, ctx) => {
    console.log("dados");
    console.log(dados);
    console.log(dados.length);

    for (var i = 0; i < dados.length; i++) {
      if(dados[i]['ModuloAPPID'] == qvf.appId){
        ctx.reply("Você tem acesso a essas perguntas meu querido!");
        qvf.userId = dados[i]['AcessosUsuarioSense'].split('\\')[1];
        console.log(qvf);
        return qvf;
      }
    }
    ctx.reply("Hmmm, acho que podemos ver outras perguntas. Que tal? Tente um /ajuda, quem sabe você não encontra o que procura lá?");

    return false;
  }
}
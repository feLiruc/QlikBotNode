function sayHello() {
	console.log('Hello you');
}

function addVat(price) {
	return new Promise((resolve, reject) => {
		let total = price * 1.2;
		
		if(total>400) {
			reject('bad vibe');
		}else{
			// console.log(total);
			resolve(total);
		}

	})
}

// function addVat(price) {
// 	let total = price * 1.2;


// 	if(total>145) {
// 		throw new Error('bad vibe');
// 	}else{
// 		console.log(total);
// 		return total;
// 	}

// }

module.exports = {
	name: 'Felipe Israel Marinho',
	email: 'felipe.marinho@bridsolucoes.com.br',
	sayHello,
	addVat,
	doStuff: async (price) => {
		let value1 = await addVat(price);
		let value2 = await addVat(value1);
		let value3 = await addVat(value2);
		let value4 = await addVat(value3);
		return value4;
	}
}

// var mysql = require('mysql2');

// const connection = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'rootCAT@',
//   database: 'db_agrobot',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // module.exports = {

// var checkAccess = async function(username){

// 	console.log("15: "+username+" tem acesso?");

// 	await getUser(username).then( async rx =>{
		
// 		if(rx[0].ativo==1){
// 			console.log("22: Tem");
// 			return true;
// 		}else{
// 			console.log("25: Não tem");
// 			await createAccess(username);
// 			return false;
// 		}

// 	});
// }

// var createAccess = async function(username){
// 	usuario = {};
// 	usuario.telegramUsername = username;
// 	usuario.ativo = 0;
// 	usuario.tipoacesso = '?';

// 	console.log("39: ENTÃO vou criar um dado na tabela de usuário");

// 	connection.query('INSERT INTO usuarios(usuario_telegram, ativo, tipoacesso) VALUES (?,?,?)', [usuario.telegramUsername, usuario.ativo, usuario.tipoacesso], (error,results) => {
//     	if(error){
//     		console.log("43: Dado não criado");
//     		return res.json({ error: error });
//     	}else{
//     		console.log("46: Dado criado");
//     		return true;
//     	}

//      });
// }

// var getUser = function(username){
// 	console.log("54: Vou pegar os dados do usuário "+username);
// 	return new Promise(resolve => {
// 		connection.query('SELECT * FROM `usuarios` WHERE `usuario_telegram` = ?', [username], function(err, results, fields) {
// 			resolve(results);
// 		});
// 	});
// }

// module.exports = {
// 	checkAccess
// };
//
// filename: 'tratativadedados.js'
// creator: 'Felipe Israel Marinho'
// email: 'felipe.marinho@bridsolucoes.com.br'
//

module.exports = {
	doStuff: async (price) => {
		let value1 = await addVat(price);
		let value2 = await addVat(value1);
		let value3 = await addVat(value2);
		let value4 = await addVat(value3);
		return value4;
	}
}
const {Wit, log} = require('node-wit');

const client = new Wit({
  accessToken: "VXK5PLSLRIHV3IK7HEVJIX4UL4AITILR"//,
  // logger: new log.Logger(log.DEBUG) // optional
});

module.exports = {
	mesmaCena: async (cenaAtual, ctx) => {
		const response = await client.message(ctx.message.text, {}).then(async (data) => {

			ctx.session.cenaAtual = cenaAtual;

			if((typeof data.entities.fato) !== 'undefined'){
				ctx.session.fato = data.entities.fato[0].value;
			}else{
				ctx.session.fato = undefined;
			}

			if((typeof data.entities.dimensao) !== 'undefined'){
				ctx.session.dimensao = data.entities.dimensao[0].value;
			}else{
				ctx.session.dimensao = undefined;
			}

			console.log("FATO ATUAL AQUI: "+cenaAtual);
			console.log("FATO DETECTADA NA CONVERSA AQUI: "+ctx.session.fato);
			console.log("DIMENSAO AQUI: "+ctx.session.dimensao);

			if( ((ctx.session.fato != cenaAtual) && ((typeof ctx.session.fato) != 'undefined')) ){
				// ctx.scene.leave();
				ctx.scene.enter(ctx.session.fato);
				return false;
			}else{
				return true;
			}
		});

		return response;
	}
}
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const mudarcena = require('./00 - mudarcena');

const formulas = require('../formulas');

const cena = new Scene('faturamento');

cena.enter(async (ctx) => {
	await ctx.reply('Você entrou na cena de Faturamento!');
	ctx.session.fato = "faturamento";

	if(typeof ctx.session.dimensao == 'undefined'){
		await formulas.executaFormula(ctx);
	}else{
		ctx.reply("Temos dimensões nesta query, vamos ver como fazer mais tarde ;)");
		await formulas.executaFormulaDimensao(ctx);
	}

	await ctx.reply('Diga quais as suas dúvidas sobre Faturamento!');
});

cena.on('message', async (ctx) => {
	await ctx.reply("Vamos ver");
	await mudarcena.mesmaCena("faturamento", ctx).then(async (data) => {
		console.log(data);
		if(data){
			ctx.reply("Olhae, estamos falando do mesmo assunto!");	

			if(typeof ctx.session.dimensao == 'undefined' || ctx.session.dimensao == ''){
				await formulas.executaFormula(ctx);
			}else{
				ctx.reply("Temos dimensões nesta query ;)");
				await formulas.executaFormulaDimensao(ctx);
			}

		}
	});
});

cena.leave(async (ctx) => {
	await ctx.reply('Você saiu da cena de Faturamento!');
});

module.exports = {
	cena
}
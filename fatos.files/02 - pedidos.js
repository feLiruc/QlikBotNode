const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const mudarcena = require('./00 - mudarcena');

const formulas = require('../formulas');

const cena = new Scene('pedidos');

cena.enter(async (ctx) => {
	await ctx.reply('Você entrou na cena de Pedidos!');
	ctx.session.fato = "pedidos";

	if(typeof ctx.session.dimensao == 'undefined'){
		await formulas.executaFormula(ctx);
	}else{
		ctx.reply("Temos dimensões nesta query, vamos ver como fazer mais tarde ;)");
		await formulas.executaFormulaDimensao(ctx);
	}

	await ctx.reply('Diga quais as suas dúvidas sobre os seus pedidos!');
});

cena.on('message', async (ctx) => {
	await ctx.reply("Vamos ver");
	await mudarcena.mesmaCena("pedidos", ctx).then(async (data) => {
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
	await ctx.reply('Você saiu da cena de Pedidos!');
});

module.exports = {
	cena
}
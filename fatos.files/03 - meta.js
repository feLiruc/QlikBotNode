const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const mudarcena = require('./00 - mudarcena');

const cena = new Scene('meta');

cena.enter(async (ctx) => {
	await ctx.reply('Você entrou na cena de Meta!');
	ctx.session.fato = "meta";

	await ctx.reply('Diga Tudo bem?');
});

cena.hears(/tudo bem/gi, async (ctx) => {
	await ctx.reply("Você me falou Tudo bem");
	await ctx.scene.leave();
});

cena.on('message', async (ctx) => {
	await ctx.reply("Vamos ver");
	await mudarcena.mesmaCena(ctx.session.fato, ctx).then((data) => {
		console.log(data);
		if(data){
			ctx.reply("Olhae, estamos falando do mesmo assunto!");	
		}
	});
});

cena.leave(async (ctx) => {
	await ctx.reply('Você saiu da cena de Meta!');
});

module.exports = {
	cena
}
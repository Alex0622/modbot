exports.message = (message, channels, database) => {
  if(!message.guild || message.author.bot)
    return;
  if(message.member.hasPermission('MANAGE_MESSAGES'))
    return;

  if(channels.get(message.channel.id)&&channels.get(message.channel.id).cooldown){
    let cooldown = channels.get(message.channel.id).cooldown;
    if(message.content.includes('.aternos.me')) {
      let words = message.content.replace(/[^0-9a-z .]/gi, ' ').split(' ');
      let ips = words.filter(word => word.includes('.aternos.me'));

      ips.forEach( ip => {
        database.query('SELECT * FROM servers WHERE ip = ?', [ip], function(err, result) {
          if(result[0]){
            let data = result[0];

            let difference = parseInt(data.timestamp,10) + cooldown - Math.floor(Date.now()/1000);
            if (difference>59){
              let remaining = '';
              if (Math.floor(difference/(60*60*24))!=0) {
                remaining += Math.floor(difference/(60*60*24)) + 'd ';
              }
              if (Math.floor(difference/(60*60))!=0) {
                remaining += Math.floor(difference%(60*60*24)/(60*60)) + 'h ';
              }
              if (Math.floor(difference/60)!=0) {
                remaining += Math.floor(difference%(60*60)/60) + 'm ';
              }

              message.channel.send(`You can advertise again in ${remaining}!`)
              .then(response =>
                response.delete({timeout: 5000}).catch(error => console.error("Failed to delete a Message! ",error))
              );
              message.delete().catch(error => console.error("Failed to delete a Message! ",error));
              return;
            }
            else {
              database.query('UPDATE servers SET timestamp = ? WHERE ip = ?',[(Math.floor(Date.now()/1000)), ip]);
            }
          }
          else {
            database.query('INSERT INTO servers (ip,timestamp) VALUES (?,?)', [ip,(Math.floor(Date.now()/1000))])
          }
        });
      });
    }
  }
}

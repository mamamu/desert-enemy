var optArr=[];

function addAnotherOption(id){
  $('<div id="temp2"></div>').html("").appendTo("#results");
  $('<form id="additonalOption" class="addOpt hidden"></form>').html('<label>Click above to vote or type a new option</label><span><input id="addOpt"></input><button id="submit" type="submit">Submit</button></span>').appendTo('#temp2')
  //can't set focus here, have to do it after you remove hidden class on form(in voted options function)  
  $('#submit').addClass('clickable');  
  $('#submit').on('click', (function(){          
              var input=$('#addOpt').val();
              $.post('/create/id/' + id +"/"+input, function(r){ 
                if (r=="OK"){
                window.location.reload();
                } else {
                window.location.href=('/errorpage?msg=3');                
                }
              });               
            })
        ) 
}

function getVotedOptions(){ 
  var userHasVotedinPoll=false;
    $.get('/voted/', function(votes){        
      var $options=$('.option');       
      var opsArray=[];                   
      console.log($options);
      $options.each(function(index){
         opsArray.push( index + ": " + $options[index].innerText );
          });  
      console.log(opsArray);
    
              votes.forEach(function(vote){                
                var votedOption=vote.option;
                for (var u=0; u<opsArray.length; u++){
                  
                  if (opsArray[u].indexOf(votedOption)!=-1){ 
                    $options.each(function(index){
                      if (index==u){                        
                        if (($(this).parent().text()).indexOf('you voted for...')==-1){
                          $(this).parent().prepend("you voted for... ");
                        }                                           
                        $(this).parent().addClass('userVote');                        
                        $('.selectedPoll').addClass('unclickable');
                        userHasVotedinPoll=true;
                      }
                    })
                  }                  
                }
              })
      if (userHasVotedinPoll===false){                
                $('form').removeClass('hidden');
        //have to set focus after you remove the hidden class
                $( "#addOpt" ).focus();}
            })
  }
 function getPageOptions(poll_id){   
 $.get('/polls/select/'+poll_id, function(options){ 
        options.forEach(function(option){            
          var o=option.option+'<span class="hidden option">'+option._id+'</span>';    
          $('<div class="barSub"></div>').html(o).appendTo("#results");          
        }); 
   
   $.get('/authroute', function(user){
       if (user._id) { 
         getVotedOptions(); 
         addAnotherOption(poll_id); 
       }
      })
   //click to vote         
          $('div.barSub').on('click', function(){            
            $(this).addClass('selectedOption');            
            var opt_id=$(this).find('.hidden').text();             
            $.post('https://desert-enemy.glitch.me/polls/vote/'+poll_id+'/'+opt_id, function(ret){                
              if (ret=="userVoted"){
                window.location.href=('/errorpage?msg=1');
              } else {
                window.location.reload();
              }
            })                
          })
      }); 
  }
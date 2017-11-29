var optArr=[];
var share;
var userHasVotedinPoll;
function addAnotherOption(id){
  $('<div id="temp2"></div>').html("").appendTo("#results");
  $('<form id="additonalOption" class="addOpt hidden"></form>').html('<label>Click to vote or type a new option</label><span><input id="addOpt"></input><button id="submit" type="submit">Submit</button></span>').appendTo('#temp2')
  //can't set focus here, have to do it after you remove hidden class on form (in the auth route so the list loads first)  
  $('#submit').addClass('clickable'); 
  $('#addOpt').addClass('clickable');
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


 function getPageOptions(poll_id){   
 $.get('/polls/select/'+poll_id, function(options){
   userHasVotedinPoll=false;
        options.forEach(function(option){            
          if (option.voted==true){
            userHasVotedinPoll=true;
            var o="You Voted For... "+option.option+'<span class="hidden option">'+option._id+'</span>';    
            $('<div class="barSub userVote"></div>').html(o).appendTo("#results"); 
            $('.selectedPoll').addClass('unclickable');
          } else {
            var o=option.option+'<span class="hidden option">'+option._id+'</span>';    
            $('<div class="barSub"></div>').html(o).appendTo("#results"); 
          }
        });
   
     $.get('/authroute', function(user){
       if (user._id) { 
         //getVotedOptions(); 
         addAnotherOption(poll_id); 
         if (userHasVotedinPoll===false){                
                $('form').removeClass('hidden');
        //have to set focus after you remove the hidden class
        if (share===false){
                $( "#addOpt" ).focus();
          }
         }    
       }
      })
        
   //click to vote         
          $('.barSub').on('click', function(){  
            
            $(this).addClass('selectedOption');            
            var opt_id=$(this).find('.hidden').text();             
            $.post('https://desert-enemy.glitch.me/polls/vote/'+poll_id+'/'+opt_id, function(ret){                
              if (ret=="userVoted"){
                window.location.href=('/errorpage?msg=1');
              } else {
                window.location.href=('/detail?id='+poll_id);
              }
            })                
          })
      }); 
  }
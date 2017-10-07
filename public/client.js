// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log(':)');
  isAuth();
  refreshPolls(); 
  



function refreshPolls() {
   $('#pollspot').empty();
   $.get('/polls', function(polls) {      
    polls.forEach(function(poll) { 
      var dm=poll.poll_name+'<span class="hidden">'+poll._id+'</span>';      
      $('<div class="bar"></div>').html(dm).appendTo('#pollspot');  
    });
    $('div').click(function(){
      $('.selectedPoll').removeClass('selectedPoll');
      $('#results').remove();
      $(this).addClass('selectedPoll');
      $('<container id="results"></container>').appendTo(this);
      var id=$(this).find('.hidden').text();
      $.get('/polls/select/'+id, function(opts){
        opts.forEach(function(opt){
          //alert(opt.user);
          var o=opt.option+'<span class="hidden option">'+opt._id+'</span>';
          $('<div class="barSub"></div>').html(o).appendTo('#results');
        })
      });
    //$("#temp").text(id);
  })
  });  
}
   
function selectPoll(element){
  var $div=$(element);   
  //var id= $div.find('.hidden').text(); 
  //$("#temp").text(id);
  //$.post('/polls/select/'+id);   
}
  
  function isAuth(){
    //$.get('/authRoute', function(){
      //alert(user);
      //user parse json
      //username display on page
      //if (){
       // $('#auth').empty();
       //$('#auth').html('<a href="/logoff">Log off</a>')
      
      //}
      //else
      //$('#auth').empty();
      //$('#auth').html('<a href="/login">Log In</a>')
      
   // })
  }
  
  
});
  /*
  function upvote(element){
    var $div=$(element);    
     var id=$div.find('.hidden').text();   
    $("#temp").text(id);
   $.post('/polls/select/'+id);
   
 } 
  function change(element){
    var $div=$(element);
    $div.css("color","red");
  }
  */

//<span class="up">'+dream.upvotes+'</span>
     
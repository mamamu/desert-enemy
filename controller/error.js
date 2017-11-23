var messages={
  0: "Something went wrong. :(",
  1: "You can't vote more than once.",
  2: "Sorry, I wasn't able to mail that.",
  3: "Update was not created",
  4: "I wasn't able to delete that."
}

let param = (new URL(location)).searchParams;
var msg = param.get('msg');
console.log(msg);

$('#errorMessage').html(messages[msg]);
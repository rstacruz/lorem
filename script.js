function $(id)
{
  return document.getElementById(id);
}

function btnGenerate_onClick()
{
  var f, gen;
  gen = $('optGen').value;
  switchTo(gen);

  // Change the permalink
  if (gen == 'latin')
    { window.location.hash = ''; }
  else
    { window.location.hash = '#' + gen; }

}

function switchTo(gen)
{
  document.body.className = gen;

  f = Generators[gen].paragraphs(
      $('optParaCount').value,
      $('optLen').value);
    
  $('textOut').value = f.join("\n\n");
}

window.onload = function()
{
  $('btnGenerate')   .onclick    = btnGenerate_onClick;
  $('optParaCount')  .onchange   = btnGenerate_onClick;
  $('optLen')        .onchange   = btnGenerate_onClick;
  $('optGen')        .onchange   = btnGenerate_onClick;
  
  $('optSelect').onclick = function()
  {
    $('textOut').select();
    $('textOut').focus();
  }

  $('optShowtags').onclick = function()
  {
    // If it's already got <p> then forget it
    if ($('textOut').value.indexOf('<p>') != -1)
    {
      $('textOut').value =
        $('textOut').value.replace(/<p>|<\/p>/g,'');
    }
    else
    {
      $('textOut').value =
        $('textOut').value
          .replace(/^/,'<p>')
          .replace(/$/,'</p>')
          .replace(/(\r|\n)+(?!\$)/mg,'</p>\n\n<p>');
    }
  }
  
  if (window.location.hash) {
    var val = window.location.hash.substr(1);
    $('optGen').value = val;
    switchTo(val);
  } else {
    switchTo('latin');
  }
}

tabManager
==========

A simple jquery tab manager,easy to use.

step 1: include css.
--
	  <link href="tabManager.css" rel="stylesheet" type="text/css" />

step 2: include jquery and tabManager.
--
  	<script src="Scripts/jquery.js" type="text/javascript"></script>
  	<script src="Scripts/tabManager.js" type="text/javascript"></script>

step 3: insert html snip.
--
  	<div class="vNav">
  		<div class="tab" id="vTabs"></div>
  	</div>
  	<div id="vCtx"></div>
	
step 4: init tabManager
--
  	<script type="text/javascript">
  	var tabs = new tabManager("#vTabs", "#vCtx");
  	tabs.add("http://www.google.com","My 1st Tab");
  	</script>

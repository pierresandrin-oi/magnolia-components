<magnolia-slideshow
    data-delay="5000"
    data-transition="1500">
[#if content.slides?has_content]
	<div class="foreground">
	[#list cmsfn.children(content.slides) as slide]
		<div class="slide">
			[#if slide.caption?has_content]
			<div class="caption"> ${cmsfn.decode(slide).caption!}</div>
			[/#if]
		</div>
	[/#list]
	</div>

	<div class="background">
	[#list cmsfn.children(content.slides) as slide]
		<div class="slide">
			[#if slide.video?has_content]
			<video autoplay loop muted playsinline
				   [#if slide.image?has_content]poster="${damfn.getRendition(slide.image, "slideshow-1024").getLink()}"[/#if]>
				<source src="${damfn.getAssetLink(slide.video)!}" type="video/mp4">
			</video>
			[/#if]

			[#if slide.image?has_content]
			<picture>
				<source media="(max-width: 376px)"
						srcset="${damfn.getRendition(slide.image, "slideshow-375").getLink()}, ${damfn.getRendition(slide.image, "slideshow-375-2x").getLink()} 2x">
				<source media="(max-width: 668px)"
						srcset="${damfn.getRendition(slide.image, "slideshow-667").getLink()}, ${damfn.getRendition(slide.image, "slideshow-667-2x").getLink()} 2x">
				<source media="(max-width: 1025px)"
						srcset="${damfn.getRendition(slide.image, "slideshow-1024").getLink()}, ${damfn.getRendition(slide.image, "slideshow-1024-2x").getLink()} 2x">
				<source media="(max-width: 1441px)"
						srcset="${damfn.getRendition(slide.image, "slideshow-1440").getLink()}, ${damfn.getRendition(slide.image, "slideshow-1440-2x").getLink()} 2x">
				<source media="(max-width: 1921px)"
						srcset="${damfn.getRendition(slide.image, "slideshow-1920").getLink()}, ${damfn.getRendition(slide.image, "slideshow-1920-2x").getLink()} 2x">
				<source
						srcset="${damfn.getRendition(slide.image, "slideshow-2560").getLink()}, ${damfn.getRendition(slide.image, "slideshow-2560-2x").getLink()} 2x">

				<img src="${damfn.getRendition(slide.image, "slideshow-1920").getLink()}" alt="">
			</picture>
			[/#if]
		</div>
	[/#list]
	</div>
[/#if]
</magnolia-slideshow>

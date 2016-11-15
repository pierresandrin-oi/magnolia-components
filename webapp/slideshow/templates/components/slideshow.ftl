<magnolia-slideshow
	data-delay="5000"
	data-transition="1500">
[#if content.slides?has_content]
	[#list cmsfn.children(content.slides) as slide]
        <div class="slide">
            <template hidden>
				[#if slide.image?has_content]
					[#assign image=slide.image]
                    <picture>
                        <source media="(max-width: 376px)"
                                srcset="${damfn.getRendition(image, "smartphone").getLink()}, ${damfn.getRendition(image, "smartphone-2x").getLink()} 2x">
                        <source media="(max-width: 668px)"
                                srcset="${damfn.getRendition(image, "phablet").getLink()}, ${damfn.getRendition(image, "phablet-2x").getLink()} 2x">
                        <source media="(max-width: 1025px)"
                                srcset="${damfn.getRendition(image, "tablet").getLink()}, ${damfn.getRendition(image, "tablet-2x").getLink()} 2x">
                        <source media="(max-width: 1441px)"
                                srcset="${damfn.getRendition(image, "desktop").getLink()}, ${damfn.getRendition(image, "desktop-2x").getLink()} 2x">
                        <source media="(max-width: 1921px)"
                                srcset="${damfn.getRendition(image, "wide").getLink()}, ${damfn.getRendition(image, "wide-2x").getLink()} 2x">
                        <source
                                srcset="${damfn.getRendition(image, "extra-wide").getLink()}, ${damfn.getRendition(image, "extra-wide-2x").getLink()} 2x">
                    </picture>
				[/#if]

				[#if slide.video?has_content]
                    <video>
                        <source src="${damfn.getAssetLink(slide.video)!}">
                    </video>
				[/#if]
            </template>

			[#if slide.caption?has_content]
                <div class="caption"> ${cmsfn.decode(slide).caption!}</div>
			[/#if]
        </div>
	[/#list]
[/#if]
</magnolia-slideshow>
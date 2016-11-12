<div class="o-magnolia-asset-browser">
[#if content.rootFolder?has_content]
    [#assign rootFolder = damfn.getFolder(content.rootFolder)!]
    [#if rootFolder?has_content]
        <magnolia-asset-browser
                data-path="${rootFolder.getPath()}"
                data-name="${rootFolder.name!}"
                data-upload="${content.servletUrl!}"
        ></magnolia-asset-browser>
    [/#if]
[/#if]
</div>
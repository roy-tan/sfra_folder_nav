'use strict';
var collections = require('*/cartridge/scripts/util/collections');
var URLUtils = require('dw/web/URLUtils');

/**
 * Get folder url
 * @param {dw.content.Folder} folder - Current folder
 * @returns {string} - Url of the folder
 */
function getFolderUrl(folder) {
    var url = '#';
    if (folder.custom.contentAssetID != null)
    {
        url = URLUtils.url('Page-Show', 'cid', folder.custom.contentAssetID)
    }
    return url;
}

/**
 * Get folder content
 * @param {dw.content.Folder} folder - Current folder
 * @returns {Collection} - Content Assets
 */
function getFolderContent(folder) {
    contentAssets = [];
    var folderContent = folder.getOnlineContent();
    if (!folderContent.empty) {
        collections.forEach(folderContent, function (content) {
            if (content.custom.showInMenu == "1") {        
            converted = contentToObject(content);
            contentAssets.push(converted);    
            }
        });
    }
    return contentAssets;
}

/**
 * Get content asset url
 * @param {dw.content.Content} content - Current content
 * @returns {string} - Url of the content asset
 */
function getContentUrl(content)
{
    return URLUtils.url('Page-Show', 'cid', content.getID()).toString();
}

/**
 * Converts a given folder from dw.content.Folder to plain object
 * @param {dw.content.Folder} folder - A single folder
 * @returns {Object} plain object that represents a folder
 */
function contentToObject(content) {
    var result = {
        name: content.getName(),
        url: getContentUrl(content),
        id: content.getID()
    };
    return result;
}

/**
 * Converts a given folder from dw.content.Folder to plain object
 * @param {dw.content.Folder} folder - A single folder
 * @returns {Object} plain object that represents a folder
 */
function folderToObject(folder) {
    if (!folder.custom || !folder.custom.showInMenu) {
        return null;
    }
    var result = {
        name: folder.getDisplayName(),
        url: getFolderUrl(folder),
        id: folder.ID,
        contentAssets : getFolderContent(folder)
    };
    var subFolders = folder.getOnlineSubFolders();
    if (!subFolders.empty) {
        collections.forEach(subFolders, function (subFolder) {
            var converted = folderToObject(subFolder);            
            if (subFolder.custom.showInMenu == "1" && converted) {
                if (!result.subFolders) {
                    result.subFolders = [];
                }
                result.subFolders.push(converted);
            }            
        });
        if (result.subFolders) {
            result.complexsubFolders = result.subFolders.some(function (item) {
                return !!item.subFolders;
            });
        }
    }
    else
    {
        subFolders = null;
        result.subFolders = [];
    }
    return result;
}

/**
 * Represents a single library folder with all of it's children
 * @param {dw.util.ArrayList<dw.content.Folder>} items - Top level categories
 * @constructor
 */
function folders(items) {
    this.folders = [];
    collections.forEach(items, function (item) {
        if (item.custom && item.custom.showInMenu == "1" && item.onlineSubFolders) {
            this.folders.push(folderToObject(item));
        }
    }, this);
}

module.exports = folders;

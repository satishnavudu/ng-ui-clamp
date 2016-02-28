/**
 * ------------------------------------------------------------------------
 * dbpUIClamp entry point
 * ------------------------------------------------------------------------
 */
(function(window, factory) {
    var name = 'dbpUIClamp';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            return factory(name);
        });
    } else if (typeof module === 'object' && module.exports) {
        // only CommonJS-like environments that support module.exports,
        module.exports = factory(name);
    } else {
        // Browser globals (root is window)
        window[name] = factory(name);
    }
}(this, function(name) {
    var ng = window.angular;

    /**
     * Directive function 
     */
    function dbpUiClamp() {
        var truncateChar = '...';
        var chunks;
        var lastChunk;
        var splitChar;
        var splitChars;

        /**
         * Method to initialize values
         */
        function initialize() {
            chunks = null;
            lastChunk = null;
            splitChar = null;
            splitChars = ['.', ',', ' ', ''];
        }

        /**
         * Returns the line-height of an element as an integer.
         * @param {HTMLElement} elem Element for which to find the line-height
         * @return {Number} line height of the element
         */
        function getLineHeight(elem) {
            var style = window.getComputedStyle(elem, null);
            var lineHeight = style.getPropertyValue('line-height');
            if (lineHeight == 'normal') {
                //normal line height uses a default value of roughly 1.2
                lineHeight = parseInt(style.getPropertyValue('font-size')) * 1.2;
            }

            return parseInt(lineHeight);
        }

        /**
         * Returns the maximum height a given element should have based on the line-
         * height of the text and the given clamp value.
         * @param {HTMLElement} elem Element for which to find the height
         * @param {Number} clamp Number of lines to display
         * @return {Number} max height of the element 
         */
        function getMaxHeight(elem, clamp) {
            var lineHeight = getLineHeight(elem);
            return lineHeight * clamp;
        }

        /**
         * Recursive function which truncates the text or character using splitchar until the width 
         * or height is beneath the pass in parameter
         * @param {HTMLElement} elem Element to truncate 
         * @param {Number} height Maximum height of the element 
         * @return if exceeds height returns truncated ellipis content
         */
        function truncate(elem, height) {
            var target;
            var nodeValue;

            if (!height) return;

            target = elem.lastChild;
            nodeValue = target.nodeValue.replace(truncateChar, '');

            if (!chunks) {
                if (splitChars.length > 0) {
                    splitChar = splitChars.shift();
                }

                chunks = nodeValue.split(splitChar);
            }

            if (chunks.length > 1) {
                lastChunk = chunks.pop();
                applyEllipsis(target, chunks.join(splitChar));
            } else {
                chunks = null;
            }

            if (chunks) {
                if (elem.clientHeight <= height) {
                    if (splitChars.length >= 0 && splitChar != '') {
                        applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
                        chunks = null;
                    } else {
                        return elem.innerText;
                    }
                }
            }

            return truncate(elem, height);
        }

        /**
         * Updates target value with ellipsis
         * @return void
         */
        function applyEllipsis(target, str) {
            target.nodeValue = str + truncateChar;
        }

        /**
         * Link function 
         * @param $scope {Object} Application model
         * @param element {Element} Angular element
         */
        function linkFn($scope, element, attr) {
            var height;
            var clamp = $scope.dbpUiClamp;

            function clampText() {
                var elem = element[0];
                initialize();
                height = getMaxHeight(elem, clamp);

                if (height < elem.clientHeight) {
                    truncate(elem, height);
                }
            }

            $scope.$watch('dbpUiClamp', function(value) {
                clamp = value;
            });

            $scope.$watchGroup(['ngBind', 'ngModel'], function(values) {
                if (values[1] !== undefined) {
                    element.html(values[1]);
                }
                clampText();
            });
        }

        return {
            restrict: 'A',
            priority: 10,
            scope: {
                dbpUiClamp: '=',
                ngBind: '=',
                ngModel: '='
            },
            link: linkFn
        };
    }

    ng.module(name, [])
        .directive('dbpUiClamp', dbpUiClamp);
}));

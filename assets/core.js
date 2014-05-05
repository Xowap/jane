/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100, vars: true */
/*global angular, SpeechSynthesisUtterance, speechSynthesis */

(function (ng, SpeechSynthesisUtterance, speechSynthesis) {
    "use strict";

    var jane = ng.module('jane', ['ngAnimate']);

    jane.provider('speak', function () {
        // Private members
        var selfP = this,
            config = {};

        // Objects
        var Speak;

        // Methods
        var setConfig, $get;

        // Object bodies
        Speak = function ($rootScope, $timeout) {
            // Private members
            var self = this;

            // Public members
            self.saying = 0;

            // Methods
            var say;

            // Method bodies
            say = function (msg) {
                var u = new SpeechSynthesisUtterance(msg);

                ng.extend(u, config, {
                    onstart: function () {
                        $rootScope.$apply(function () {
                            self.saying += 1;
                        });
                    },
                    onend: function () {
                        $rootScope.$apply(function () {
                            self.saying -= 1;
                        });
                    }
                });

                $timeout(function () {
                    console.log('saying ', msg);
                    speechSynthesis.speak(u);
                });
            };

            self.say = say;
        };

        // Method bodies
        setConfig = function (newConfig) {
            config = newConfig;
        };

        $get = function ($rootScope, $timeout) {
            return new Speak($rootScope, $timeout);
        };

        selfP.setConfig = setConfig;
        selfP.$get = $get;
    });

    jane.provider('wakeUp', function () {
        var selfP = this;

        // Objects
        var WakeUp;

        // Methods
        var $get;

        WakeUp = function ($interval, speak) {
            var self = this;

            var wakeMeUp, findScheme;

            findScheme = function (timeFromEvent, scheme) {
                var found = null;

                ng.forEach(scheme, function (value) {
                    console.log(value.from, timeFromEvent);
                    if (value.from <= timeFromEvent) {
                        found = value;
                    }
                });

                return found;
            };

            wakeMeUp = function (date, scheme) {
                $interval(function () {
                    var diff = parseInt((Date.now() - date.getTime()) / 60000, 10),
                        use = findScheme(diff, scheme);

                    if (use === null) {
                        console.log("No scheme found!");
                        return;
                    }

                    if (use.count === undefined) {
                        use.count = 0;
                    }

                    if (use.count % use.frequency === 0) {
                        speak.say(use.template.replace('{}', Math.abs(diff).toString()));
                    }

                    use.count += 1;
                }, 60000);
            };

            self.wakeMeUp = wakeMeUp;
        };

        $get = function ($interval, speak) {
            return new WakeUp($interval, speak);
        };

        selfP.$get = $get;
    });

    jane.controller('MainCtrl', function ($scope, wakeUp, speak, $timeout) {
        speak.say('Hello master!');

        wakeUp.wakeMeUp(new Date(2014, 4, 5, 9, 0), [
            {
                from: -60,
                frequency: 5,
                template: "You are waking up in {} minutes"
            },
            {
                from: -10,
                frequency: 1,
                template: "You are waking up in {} minutes"
            },
            {
                from: 0,
                frequency: 1,
                template: "Wake up now. I repeat, wake up now"
            },
            {
                from: 1,
                frequency: 1,
                template: "You are {} fucking minutes late"
            }
        ]);

        $scope.speak = speak;
    });
}(angular, SpeechSynthesisUtterance, speechSynthesis));

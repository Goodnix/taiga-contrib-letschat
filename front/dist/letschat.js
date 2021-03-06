// Generated by CoffeeScript 1.9.1
(function() {
  var LetsChatAdmin, LetsChatWebhooksDirective, debounce, initLetsChatPlugin, letsChatInfo, module;

  this.taigaContribPlugins = this.taigaContribPlugins || [];

  letsChatInfo = {
    slug: "letschat",
    name: "Let's Chat",
    type: "admin",
    module: 'taigaContrib.letschat'
  };

  this.taigaContribPlugins.push(letsChatInfo);

  module = angular.module('taigaContrib.letschat', []);

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  initLetsChatPlugin = function($tgUrls) {
    return $tgUrls.update({
      "letschat": "/letschat"
    });
  };

  LetsChatAdmin = (function() {
    LetsChatAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "$appTitle", "$tgConfirm", "$tgHttp"];

    function LetsChatAdmin(rootScope, scope, repo, appTitle, confirm, http) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appTitle = appTitle;
      this.confirm = confirm;
      this.http = http;
      this.scope.sectionName = "Let's Chat";
      this.scope.sectionSlug = "letschat";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("letschat", {
            project: _this.scope.projectId
          });
          promise.then(function(letschathooks) {
            _this.scope.letschathook = {
              project: _this.scope.projectId
            };
            if (letschathooks.length > 0) {
              _this.scope.letschathook = letschathooks[0];
            }
            return _this.appTitle.set("LetsChat - " + _this.scope.project.name);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    LetsChatAdmin.prototype.testHook = function() {
      var promise;
      promise = this.http.post(this.repo.resolveUrlForModel(this.scope.letschathook) + '/test');
      promise.success((function(_this) {
        return function(_data, _status) {
          return _this.confirm.notify("success");
        };
      })(this));
      return promise.error((function(_this) {
        return function(data, status) {
          return _this.confirm.notify("error");
        };
      })(this));
    };

    return LetsChatAdmin;

  })();

  module.controller("ContribLetsChatAdminController", LetsChatAdmin);

  LetsChatWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          $loading.start(submitButton);
          if (!$scope.letschathook.id) {
            promise = $repo.create("letschat", $scope.letschathook);
            promise.then(function(data) {
              return $scope.letschathook = data;
            });
          } else if ($scope.letschathook.url) {
            promise = $repo.save($scope.letschathook);
            promise.then(function(data) {
              return $scope.letschathook = data;
            });
          } else {
            promise = $repo.remove($scope.letschathook);
            promise.then(function(data) {
              return $scope.letschathook = {
                project: $scope.projectId
              };
            });
          }
          promise.then(function(data) {
            $loading.finish(submitButton);
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            $loading.finish(submitButton);
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module.directive("contribLetschatWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", LetsChatWebhooksDirective]);

  module.run(["$tgUrls", initLetsChatPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('contrib/letschat', '<div contrib-letschat-webhooks="contrib-letschat-webhooks" ng-controller="ContribLetsChatAdminController as ctrl"><header><h1 tg-main-title="tg-main-title"></h1></header><form><div class="contrib-form-wrapper"><fieldset class="contrib-input"><label for="url">Let\'s Chat messages endpoint</label><input type="text" name="url" ng-model="letschathook.url" placeholder="Let\'s Chat messages endpoint" id="url"/><label for="token">Let\'s Chat Auth token</label><input type="text" name="token" ng-model="letschathook.token" placeholder="Let\'s Chat Auth token" id="token"/></fieldset></div><fieldset ng-show="letschathook.id"><a href="" title="Test" ng-click="ctrl.testHook()" style="display:block;text-align: center;" class="button-gray"><span>Test</span></a></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(letschathook)" class="button-green submit-button"><span>Save</span></a></form><!--a.help-button(href="https://taiga.io/support/letschat-integration/", target="_blank")--><!--    span.icon.icon-help--><!--    span Do you need help? Check out our support page!--><span>Let\'s Chat messages endpoint :host/rooms/:room_id_or_slug/messages</span></div>');
    }
  ]);

}).call(this);

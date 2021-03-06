
(function() {
  var Backbone, FSM, tests;
  tests = {
    basic: {
      type: function(test) {
        test.equal(typeof FSM, 'object', 'FSM should be an object');
        return test.done();
      },
      mixin: function(test) {
        var obj;
        obj = {
          foo: 'bar'
        };
        FSM.mixin(obj);
        test.equal(typeof obj.transitionTo, 'function', 'FSM.mixin should extend obj with new method "transitionTo"');
        test.equal(typeof obj.mixin, 'undefined', 'Mixin method should not be in obj');
        test.throws((function() {
          return FSM();
        }), null, 'FSM.mixin without arguments should throw an error');
        return test.done();
      },
      tryToTrigger: {
        backboneModel: function(test) {
          var Model, model;
          Model = Backbone.Model.extend({
            initialize: function() {
              return FSM.mixin(this);
            }
          });
          model = new Model();
          model.on('foo', function() {
            test.ok(true);
            return test.done();
          });
          return model._tryToTrigger('foo');
        },
        plainObject: function(test) {
          var o;
          o = {};
          FSM.mixin(o);
          test.doesNotThrow(function() {
            return o._tryToTrigger('foo');
          });
          return test.done();
        }
      }
    },
    initialize: {
      returnValue: function(test) {
        var o;
        o = Object.create(FSM).initialize();
        test.ok(typeof o === 'object');
        return test.done();
      },
      innerState: function(test) {
        var o;
        o = Object.create(FSM);
        o._resetAll();
        test.equal(o._state, null);
        test.deepEqual(o._states, []);
        test.equal(o._currentTransition, null);
        test.deepEqual(o._transitions, {});
        return test.done();
      },
      stateless: function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          }
        });
        model = new Model();
        test.equal(model.getCurrentState(), void 0, 'State of stateless model should be undefined');
        return test.done();
      }
    },
    currentTransition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      getCurrentTransition: function(test) {
        test.equal(this.model.getCurrentTransition(), null);
        return test.done();
      },
      setCurrentTransitionValid: function(test) {
        this.model.setCurrentTransition('trans1');
        test.equal(this.model.getCurrentTransition().name, 'trans1');
        return test.done();
      },
      setCurrentTransitionInvalidValue: function(test) {
        var _this = this;
        test.throws(function() {
          return _this.model.setCurrentTransition('xxx');
        });
        return test.done();
      },
      resetCurrentTransition: function(test) {
        this.model.setCurrentTransition('trans1');
        this.model.resetCurrentTransition();
        test.equal(this.model.getCurrentTransition(), null);
        return test.done();
      }
    },
    makeTransition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      startTransition: function(test) {
        this.model.on('transition:start', function(transition) {
          return test.equal(transition.name, 'trans1');
        });
        this.model.startTransition('trans1');
        test.equal(this.model.getCurrentTransition().name, 'trans1');
        test.expect(2);
        return test.done();
      },
      startInvalidTransition: function(test) {
        var _this = this;
        test.throws(function() {
          return model.startTransition('xxx');
        });
        test.throws(function() {
          return model.startTransition();
        });
        return test.done();
      },
      stopTransition: function(test) {
        this.model.on('transition:stop', function(transition) {
          return test.equal(transition.name, 'trans1');
        });
        this.model.startTransition('trans1');
        this.model.stopTransition();
        test.equal(this.model.getCurrentTransition(), null);
        test.expect(2);
        return test.done();
      },
      doubleStartTransition: function(test) {
        var _this = this;
        test.throws(function() {
          _this.model.startTransition('trans1');
          return _this.model.startTransition('trans2');
        });
        return test.done();
      },
      makeTransition: function(test) {
        var Model, model;
        Model = this.Model.extend({
          onTrans1: function(cb) {
            test.ok(true);
            return cb();
          }
        });
        model = new Model();
        return model.makeTransition('trans1', function() {
          test.expect(1);
          return test.done();
        });
      }
    },
    currentState: {
      setUp: function(cb) {
        this.o = Object.create(FSM).initialize({
          transitions: {
            fooBar: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        return cb();
      },
      setCurrentState: function(test) {
        this.o.setCurrentState('bar');
        test.equal(this.o.getCurrentState(), 'bar');
        return test.done();
      },
      invalidSetSurrentState: function(test) {
        var o;
        o = Object.create(FSM).initialize();
        test.throws(function() {
          return o.setCurrentState('foo');
        });
        return test.done();
      },
      resetCurrentState: function(test) {
        this.o.resetCurrentState();
        test.equal(this.o.getCurrentState(), null);
        return test.done();
      }
    },
    state: {
      setUp: function(cb) {
        this.o = Object.create(FSM).initialize({
          transitions: {
            fooBar: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        return cb();
      },
      getStates: function(test) {
        test.deepEqual(this.o.getStates(), ['foo', 'bar']);
        return test.done();
      },
      addState: function(test) {
        this.o.addState('baz');
        this.o.addState('foo');
        test.deepEqual(this.o.getStates(), ['foo', 'bar', 'baz']);
        return test.done();
      },
      addStates: function(test) {
        this.o.addStates('baz', 'foo');
        test.deepEqual(this.o.getStates(), ['foo', 'bar', 'baz']);
        return test.done();
      }
    },
    transition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            },
            trans3: {
              from: 'bar',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      getTransition: function(test) {
        var transition;
        transition = this.model.getTransition('trans1');
        test.equal(transition.name, 'trans1');
        test.equal(transition.from, 'foo');
        test.equal(transition.to, 'bar');
        return test.done();
      },
      getInvalidTransition: function(test) {
        var _this = this;
        test.throws(function() {
          return _this.model.getTransition('xxx');
        });
        return test.done();
      },
      getTransitionFromToValid: function(test) {
        test.equal(this.model.getTransitionFromTo('bar', 'baz').name, 'trans3');
        return test.done();
      },
      getTransitionFromToInvalid: function(test) {
        test.equal(this.model.getTransitionFromTo('xxx', 'yyy'), null);
        test.equal(this.model.getTransitionFromTo('bar'), null);
        return test.done();
      },
      _addTransitionObject: function(test) {
        var o;
        o = Object.create(FSM).initialize();
        o._addTransitionObject({
          name: 'xxxYyy',
          from: 'xxx',
          to: 'yyy'
        });
        test.equal(o.getTransition('xxxYyy').from, 'xxx');
        test.deepEqual(o.getStates(), ['xxx', 'yyy']);
        return test.done();
      },
      _createTransitionObject: function(test) {
        var t;
        t = FSM._createTransitionObject('fooBar', 'foo', 'bar');
        test.deepEqual(t, {
          name: 'fooBar',
          from: 'foo',
          to: 'bar'
        });
        return test.done();
      }
    },
    isValidTransition: {
      valid: function(test) {
        test.ok(!FSM.isValidTransition({
          name: 'fooBar',
          from: 'foo',
          to: 'bar'
        }));
        return test.done();
      },
      invalid: function(test) {
        test.equal("Transition 'fooBar' is not valid", FSM.isValidTransition({
          name: 'fooBar',
          from: 'foo'
        }));
        return test.done();
      },
      ambiguous: function(test) {
        var o;
        o = Object.create(FSM).initialize({
          transitions: {
            fooBar: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        test.equal("Ambiguous transition 'fooBar2'", o.isValidTransition({
          name: 'fooBar2',
          from: 'foo',
          to: 'bar'
        }));
        return test.done();
      }
    },
    defaultState: {
      "default": function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            },
            disabling: {
              from: 'ready',
              to: 'disabled'
            }
          }
        });
        model = new Model();
        test.equal(model.getCurrentState(), 'unrendered');
        return test.done();
      },
      explicit: function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          defaultState: 'ready',
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            }
          }
        });
        model = new Model();
        test.equal(model.getCurrentState(), 'ready', 'FSM.mixin should respect default state set explicitly');
        return test.done();
      },
      invalidState: function(test) {
        var Model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          defaultState: 'foo',
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            }
          }
        });
        test.throws(function() {
          var model;
          return model = new Model();
        });
        return test.done();
      }
    },
    transitionTo: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        return cb();
      },
      basic: function(test) {
        var model;
        model = new this.Model();
        return model.transitionTo('bar', function() {
          test.equal(model.getCurrentState(), 'bar', 'State should be changed');
          return test.done();
        });
      },
      invalid: function(test) {
        var model;
        model = new this.Model();
        return model.transitionTo('bar', function() {
          test.throws((function() {
            return model.transitionTo('foo');
          }), null, 'Undefined transition should throw an error');
          return test.done();
        });
      }
    }
  };
  if (typeof module !== 'undefined' && module.exports) {
    exports.FSM = FSM = require('../lib/backbone-fsm');
    exports.Backbone = Backbone = require('backbone');
    return exports.tests = tests;
  } else {
    Backbone = window.Backbone;
    FSM = window.FSM;
    return window.tests = tests;
  }
})();

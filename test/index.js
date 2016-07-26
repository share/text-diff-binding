var expect = require('expect.js');
var TextDiffBinding = require('../index.js');

global.document = {};

describe('TextDiffBinding', function() {
  beforeEach(function() {
    // Mock an HTML text input or textarea
    var element = this.element = {
      value: '',
      selectionStart: 0,
      selectionEnd: 0,
      selectionDirection: 'none'
    };
    element.setSelectionRange = function(selectionStart, selectionEnd, selectionDirection) {
      element.selectionStart = selectionStart;
      element.selectionEnd = selectionEnd;
      element.selectionDirection = selectionDirection || 'none';
    };
    document.activeElement = element;
    this.value = '';
    this.binding = new TextDiffBinding(element);
    var self = this;
    this.binding._get = function() {
      return self.value;
    };
  });

  it('supports calling update when values are equal', function() {
    this.binding.update();
  });

  it('throws on update if ::_get is not defined', function() {
    var binding = new TextDiffBinding(this.element);
    expect(function() {
      binding.update();
    }).throwException(/_get/);
  });

  it('throws on event if ::_insert is not defined', function() {
    var binding = this.binding;
    this.element.value = 'x';
    expect(function() {
      binding.onInput();
    }).throwException(/_insert/);
  });

  it('throws on event if ::_remove is not defined', function() {
    var binding = this.binding;
    this.value = 'x';
    expect(function() {
      binding.onInput();
    }).throwException(/_remove/);
  });

  it('calls ::_insert on single character', function(done) {
    this.element.value = 'x';
    this.binding._insert = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_insert on single character append', function(done) {
    this.element.value = 'xy';
    this.value = 'x';
    this.binding._insert = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('y');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_insert on single character prepend', function(done) {
    this.element.value = 'yx';
    this.value = 'x';
    this.binding._insert = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('y');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_insert on characters within', function(done) {
    this.element.value = 'x12xq';
    this.value = 'xxq';
    this.binding._insert = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('12');
      done();
    };
    this.binding.onInput();
  });

  it('inserts prior to cursor position at beginning', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 1;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('inserts prior to cursor position in middle', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 2;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('inserts prior to cursor position at end', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 3;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('only uses cursor position when element is focused', function(done) {
    document.activeElement = null;
    this.element.selectionStart = this.element.selectionEnd = 2;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('prefers insert at string end when ambiguous and cursor position cannot match insert', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 0;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('prefers insert at string end when ambiguous and cursor position is not usable', function(done) {
    this.element.selectionStart = this.element.selectionEnd = undefined;
    this.element.value = 'xxx';
    this.value = 'xx';
    this.binding._insert = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_remove on single character', function(done) {
    this.value = 'x';
    this.binding._remove = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_remove on single character at end', function(done) {
    this.element.value = 'x';
    this.value = 'xy';
    this.binding._remove = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('y');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_remove on single character at start', function(done) {
    this.element.value = 'x';
    this.value = 'yx';
    this.binding._remove = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('y');
      done();
    };
    this.binding.onInput();
  });

  it('calls ::_remove on characters within', function(done) {
    this.element.value = 'xxq';
    this.value = 'x12xq';
    this.binding._remove = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('12');
      done();
    };
    this.binding.onInput();
  });

  it('removes prior to cursor position at beginning', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 0;
    this.element.value = 'xx';
    this.value = 'xxx';
    this.binding._remove = function(index, text) {
      expect(index).equal(0);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('removes prior to cursor position in middle', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 1;
    this.element.value = 'xx';
    this.value = 'xxx';
    this.binding._remove = function(index, text) {
      expect(index).equal(1);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('removes prior to cursor position at end', function(done) {
    this.element.selectionStart = this.element.selectionEnd = 2;
    this.element.value = 'xx';
    this.value = 'xxx';
    this.binding._remove = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('prefers remove at string end when ambiguous and cursor position is not usable', function(done) {
    this.element.selectionStart = this.element.selectionEnd = undefined;
    this.element.value = 'xx';
    this.value = 'xxx';
    this.binding._remove = function(index, text) {
      expect(index).equal(2);
      expect(text).equal('x');
      done();
    };
    this.binding.onInput();
  });

  it('does nothing on event if value is equal', function(done) {
    this.element.value = 'x';
    this.value = 'x';
    done();
    this.binding._insert = done;
    this.binding._remove = done;
    this.binding.onInput();
  });

  it('normalizes Windows style line endings from element', function(done) {
    // This works since we mocked a DOM element, but a proper element would
    // normalize line endings upon setting value
    this.element.value = 'x\r\n\r\ny\r\n';
    this.value = 'x\n\ny';
    this.binding._insert = function(index, text) {
      expect(index).equal(4);
      expect(text).equal('\n');
      done();
    };
    this.binding.onInput();
  });

  it('inserting text at position of cursor does not move cursor', function() {
    this.value = 'x';
    this.binding.onInsert(0, 1);
    expect(this.element.selectionStart).equal(0);
    expect(this.element.selectionEnd).equal(0);
    expect(this.element.value).equal('x');
  });

  it('inserting text after position of cursor does not move cursor', function() {
    this.value = 'xyz';
    this.element.value = 'x';
    this.binding.onInsert(1, 2);
    expect(this.element.selectionStart).equal(0);
    expect(this.element.selectionEnd).equal(0);
    expect(this.element.value).equal('xyz');
  });

  it('inserting text before position of cursor moves cursor', function() {
    this.value = 'yzx';
    this.element.value = 'x';
    this.element.selectionStart = 1;
    this.element.selectionEnd = 1;
    this.binding.onInsert(0, 2);
    expect(this.element.selectionStart).equal(3);
    expect(this.element.selectionEnd).equal(3);
    expect(this.element.value).equal('yzx');
  });

  it('removing text at position of cursor does not move cursor', function() {
    this.element.value = 'x';
    this.binding.onRemove(0, 1);
    expect(this.element.selectionStart).equal(0);
    expect(this.element.selectionEnd).equal(0);
    expect(this.element.value).equal('');
  });

  it('removing text after position of cursor does not move cursor', function() {
    this.value = 'x';
    this.element.value = 'xyz';
    this.binding.onRemove(1, 2);
    expect(this.element.selectionStart).equal(0);
    expect(this.element.selectionEnd).equal(0);
    expect(this.element.value).equal('x');
  });

  it('removing text before position of cursor moves cursor', function() {
    this.value = 'x';
    this.element.value = 'yzx';
    this.element.selectionStart = 3;
    this.element.selectionEnd = 3;
    this.binding.onRemove(0, 2);
    expect(this.element.selectionStart).equal(1);
    expect(this.element.selectionEnd).equal(1);
    expect(this.element.value).equal('x');
  });

  it('does not move cursor when not the document.activeElement', function() {
    document.activeElement = null;
    this.value = 'x';
    this.element.value = 'yzx';
    this.element.selectionStart = 3;
    this.element.selectionEnd = 3;
    this.binding.onRemove(0, 2);
    expect(this.element.selectionStart).equal(3);
    expect(this.element.selectionEnd).equal(3);
    expect(this.element.value).equal('x');
  });
});

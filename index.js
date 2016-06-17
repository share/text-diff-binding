module.exports = TextDiffBinding;

function TextDiffBinding(element) {
  this.element = element;
}

TextDiffBinding.prototype._get =
TextDiffBinding.prototype._insert =
TextDiffBinding.prototype._remove = function() {
  throw new Error('`_get()`, `_insert(index, length)`, and `_remove(index, length)` prototype methods must be defined.');
};

TextDiffBinding.prototype._getElementValue = function() {
  var value = this.element.value;
  // IE and Opera replace \n with \r\n. Always store strings as \n
  return value.replace(/\r\n/g, '\n');
};

TextDiffBinding.prototype.onInput = function() {
  var previous = this._get();
  var value = this._getElementValue();
  if (previous === value) return;
  var start = 0;
  while (previous.charAt(start) === value.charAt(start)) {
    start++;
  }
  var end = 0;
  while (
    previous.charAt(previous.length - 1 - end) === value.charAt(value.length - 1 - end) &&
    end + start < previous.length &&
    end + start < value.length
  ) {
    end++;
  }

  if (previous.length !== start + end) {
    var removed = previous.slice(start, previous.length - end);
    this._remove(start, removed);
  }
  if (value.length !== start + end) {
    var inserted = value.slice(start, value.length - end);
    this._insert(start, inserted);
  }
};

TextDiffBinding.prototype.onInsert = function(index, length) {
  var selectionStart = this._insertCursorTransform(index, length, this.element.selectionStart);
  var selectionEnd = this._insertCursorTransform(index, length, this.element.selectionEnd);
  this.update();
  this.element.selectionStart = selectionStart;
  this.element.selectionEnd = selectionEnd;
};
TextDiffBinding.prototype._insertCursorTransform = function(index, length, cursor) {
  return (index < cursor) ? cursor + length : cursor;
};

TextDiffBinding.prototype.onRemove = function(index, length) {
  var selectionStart = this._removeCursorTransform(index, length, this.element.selectionStart);
  var selectionEnd = this._removeCursorTransform(index, length, this.element.selectionEnd);
  this.update();
  this.element.selectionStart = selectionStart;
  this.element.selectionEnd = selectionEnd;
};
TextDiffBinding.prototype._removeCursorTransform = function(index, length, cursor) {
  return (index < cursor) ? cursor - Math.min(length, cursor - index) : cursor;
};

TextDiffBinding.prototype.update = function() {
  var value = this._get();
  if (this._getElementValue() === value) return;
  var scrollTop = this.element.scrollTop;
  this.element.value = value;
  if (this.element.scrollTop !== scrollTop) {
    this.element.scrollTop = scrollTop;
  }
};

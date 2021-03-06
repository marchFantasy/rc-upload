'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _uid = require('./uid');

var _uid2 = _interopRequireDefault(_uid);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var iframeStyle = {
  position: 'absolute',
  top: 0,
  opacity: 0,
  filter: 'alpha(opacity=0)',
  left: 0,
  zIndex: 9999
};
var IframeUploader = _react2['default'].createClass({
  displayName: 'IframeUploader',

  propTypes: {
    onStart: _react.PropTypes.func,
    multiple: _react.PropTypes.bool,
    children: _react.PropTypes.any,
    data: _react.PropTypes.object,
    action: _react.PropTypes.string,
    name: _react.PropTypes.string
  },

  componentDidMount: function componentDidMount() {
    this.updateIframeWH();
    this.initIframe();
  },

  componentDidUpdate: function componentDidUpdate() {
    this.updateIframeWH();
  },

  onLoad: function onLoad() {
    if (!this.loading) {
      return;
    }
    var props = this.props;
    var response = undefined;
    var eventFile = this.file;
    try {
      var doc = this.getIframeDocument();
      var script = doc.getElementsByTagName('script')[0];
      if (script && script.parentNode === doc.body) {
        doc.body.removeChild(script);
      }
      response = doc.body.innerHTML;
      props.onSuccess(response, eventFile);
    } catch (err) {
      (0, _warning2['default'])(false, 'cross domain error for Upload. Maybe server should return document.domain script. see Note from https://github.com/react-component/upload');
      response = 'cross-domain';
      props.onError(err, null, eventFile);
    }
    this.enableIframe();
    this.initIframe();
  },

  onChange: function onChange() {
    var target = this.getFormInputNode();
    // ie8/9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    var file = this.file = {
      uid: (0, _uid2['default'])(),
      name: target.value
    };
    this.props.onStart(this.getFileForMultiple(file));
    var formNode = this.getFormNode();
    var dataSpan = this.getFormDataNode();
    var data = this.props.data;
    if (typeof data === 'function') {
      data = data();
    }
    var inputs = [];
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        inputs.push('<input name="' + key + '" value="' + data[key] + '"/>');
      }
    }
    dataSpan.innerHTML = inputs.join('');
    formNode.submit();
    dataSpan.innerHTML = '';
    this.disabledIframe();
  },

  getIframeNode: function getIframeNode() {
    return this.refs.iframe;
  },

  getIframeDocument: function getIframeDocument() {
    return this.getIframeNode().contentDocument;
  },

  getFormNode: function getFormNode() {
    return this.getIframeDocument().getElementById('form');
  },

  getFormInputNode: function getFormInputNode() {
    return this.getIframeDocument().getElementById('input');
  },

  getFormDataNode: function getFormDataNode() {
    return this.getIframeDocument().getElementById('data');
  },

  getFileForMultiple: function getFileForMultiple(file) {
    return this.props.multiple ? [file] : file;
  },

  getIframeHTML: function getIframeHTML(domain) {
    var domainScript = '';
    var domainInput = '';
    if (domain) {
      domainScript = '<script>document.domain="' + domain + '";</script>';
      domainInput = '<input name="_documentDomain" value="' + domain + '" />';
    }
    return '\n    <!DOCTYPE html>\n    <html>\n    <head>\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <style>\n    body,html {padding:0;margin:0;border:0;overflow:hidden;}\n    </style>\n    ' + domainScript + '\n    </head>\n    <body>\n    <form method="post"\n    encType="multipart/form-data"\n    action="' + this.props.action + '" id="form" style="display:block;height:9999px;position:relative;overflow:hidden;">\n    <input id="input" type="file"\n     name="' + this.props.name + '"\n     style="position:absolute;top:0;right:0;height:9999px;font-size:9999px;cursor:pointer;"/>\n    ' + domainInput + '\n    <span id="data"></span>\n    </form>\n    </body>\n    </html>\n    ';
  },

  initIframeSrc: function initIframeSrc() {
    if (this.domain) {
      this.getIframeNode().src = 'javascript:void((function(){\n        var d = document;\n        d.open();\n        d.domain=\'' + this.domain + '\';\n        d.write(\'\');\n        d.close();\n      })())';
    }
  },

  initIframe: function initIframe() {
    var iframeNode = this.getIframeNode();
    var win = iframeNode.contentWindow;
    var doc = undefined;
    this.domain = this.domain || '';
    this.initIframeSrc();
    try {
      doc = win.document;
    } catch (e) {
      this.domain = document.domain;
      this.initIframeSrc();
      win = iframeNode.contentWindow;
      doc = win.document;
    }
    doc.open('text/html', 'replace');
    doc.write(this.getIframeHTML(this.domain));
    doc.close();
    this.getFormInputNode().onchange = this.onChange;
  },

  enableIframe: function enableIframe() {
    this.loading = false;
    this.getIframeNode().style.display = '';
  },

  disabledIframe: function disabledIframe() {
    this.loading = true;
    this.getIframeNode().style.display = 'none';
  },

  updateIframeWH: function updateIframeWH() {
    var rootNode = _reactDom2['default'].findDOMNode(this);
    var iframeNode = this.getIframeNode();
    iframeNode.style.height = rootNode.offsetHeight + 'px';
    iframeNode.style.width = rootNode.offsetWidth + 'px';
  },

  render: function render() {
    return _react2['default'].createElement(
      'span',
      { style: { position: 'relative', zIndex: 0 } },
      _react2['default'].createElement('iframe', { ref: 'iframe',
        onLoad: this.onLoad,
        style: iframeStyle }),
      this.props.children
    );
  }
});

exports['default'] = IframeUploader;
module.exports = exports['default'];
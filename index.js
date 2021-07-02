const axios = require('axios');

const MachineSizeOptions = {
  Small: 'small',
  Standard: 'standard',
  Large: 'large',
  ExtraLarge: 'xlarge',
};

const ManageRecordingsOptions = {
  True: 'true',
  False: 'false',
  Both: 'both',
};

const MachineStatusOptions = {
  Starting: 'STARTING',
  Available: 'AVAILABLE',
  Stopping: 'STOPPING',
  Stopped: 'STOPPED',
  Deleted: 'DELETED',
};

function BBBOnDemand(
  customerId,
  apitoken,
  secret,
  { domain, apiPath, apiVersion, httpClient } = {}
) {
  this.customerId = customerId;
  this.secret = secret;
  this.apitoken = apitoken;
  this.domain = domain || 'bbbondemand.com';
  this.apiPath = apiPath || '/api';
  this.apiVersion = apiVersion || 'v1';
  this.httpClient = httpClient || axios.create();
  this.baseUrl = `https://${this.domain}${this.apiPath}/${this.apiVersion}/${this.customerId}/vm`;
}

BBBOnDemand.prototype._appendKeys = function (obj, params) {
  return Object.keys(params).reduce((acc, key) => {
    if (params[key]) {
      acc[key] = params[key];
    }
    return acc;
  }, obj);
};

BBBOnDemand.prototype._checkIfIsInEnumObject = function (obj, value) {
  return Object.keys(obj).filter((key) => obj[key] === value).length > 0;
};

BBBOnDemand.prototype._checkValidMachineSize = function (value) {
  return this._checkIfIsInEnumObject(MachineSizeOptions, value);
};

BBBOnDemand.prototype._checkValidManageRecordingsOptions = function (value) {
  return this._checkIfIsInEnumObject(ManageRecordingsOptions, value);
};

BBBOnDemand.prototype._checkValidMachineStatus = function (value) {
  return this._checkIfIsInEnumObject(MachineStatusOptions, value);
};

BBBOnDemand.prototype._defaultResponseHandler = function (response) {
  return response.data;
};

BBBOnDemand.prototype._defaultErrorHandler = function (error) {
  return Promise.reject(error);
};

BBBOnDemand.prototype._request = function (method, path, params, data) {
  return this.httpClient
    .request({
      url: path,
      baseURL: this.baseUrl,
      data: data,
      params: params,
      headers: {
        'Content-Type': 'application/json',
        APITOKEN: this.apitoken,
      },
      method: method,
    })
    .then((result) => Promise.resolve(result.data));
};

BBBOnDemand.prototype.billing = function () {
  return this._request('GET', '/billing/activity');
};

BBBOnDemand.prototype.instances = function (Region, ManageRecordings, Status) {
  if (ManageRecordings && !this._checkValidManageRecordingsOptions(ManageRecordings))
    return Promise.reject('Invalid Manage Recordings filter');
  if (Status && !this._checkValidMachineStatus(Status))
    return Promise.reject('Invalid Machine Status filter');
  return this._request('GET', '/instances', {
    ManageRecordings,
    Region,
    Status,
  });
};

BBBOnDemand.prototype.instance = function (InstanceId) {
  return this._request('GET', `/instances/${InstanceId}`);
};

BBBOnDemand.prototype.instanceHistory = function (InstanceId) {
  return this._request('GET', `/instances/${InstanceId}/history`);
};

BBBOnDemand.prototype.startInstance = function (InstanceId) {
  return this._request('POST', '/instances/start', {}, { InstanceId });
};

BBBOnDemand.prototype.stopInstance = function (InstanceID) {
  return this._request('POST', '/instances/stop', {}, { InstanceID });
};

BBBOnDemand.prototype.createInstance = function (
  MachineSize,
  Region,
  ManageRecordings,
  Tags,
  CallBack
) {
  if (!this._checkValidMachineSize(MachineSize))
    return Promise.reject('Invalid Machine Size');
  const bodyRequest = this._appendKeys({
    MachineSize,
    Region,
    ManageRecordings,
    Tags,
    CallBack,
  });
  return this._request('POST', '/instances', {}, bodyRequest);
};

BBBOnDemand.prototype.deleteInstance = function (InstanceId) {
  return this._request('DELETE', `/instances/${InstanceId}`);
};

BBBOnDemand.prototype.regions = function () {
  return this._request('GET', '/regions');
};

BBBOnDemand.prototype.meetings = function () {
  return this._request('GET', '/meetings');
};

BBBOnDemand.prototype.meeting = function (MeetingId) {
  return this._request('GET', `/meetings/${MeetingId}`);
};

BBBOnDemand.prototype.records = function () {
  return this._request('GET', '/recordings');
};

BBBOnDemand.prototype.record = function (RecordingID) {
  return this._request('GET', `/recordings/${RecordingID}`);
};

BBBOnDemand.prototype.publishRecord = function (RecordingID) {
  return this._request('POST', '/recordings/publish', {}, { RecordingID });
};

BBBOnDemand.prototype.unpublishRecord = function (RecordingID) {
  return this._request('POST', '/recordings/unpublish', {}, { RecordingID });
};

BBBOnDemand.prototype.deleteRecord = function (RecordingID) {
  return this._request('DELETE', `/recordings/${RecordingID}`);
};

module.exports = {
  BBBOnDemand,
  MachineSizeOptions,
  ManageRecordingsOptions,
  MachineStatusOptions,
};

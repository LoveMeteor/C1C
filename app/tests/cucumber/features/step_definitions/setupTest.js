/**
 * Created by jaross on 06/10/16.
 */
module.exports = function () {
    const cmdTest = 'meteor test --driver-package practicalmeteor:mocha';
    var baseRepo = '';

    this.Given(/^I am in cic\-cms repo$/, function () {
        baseRepo = this.FileHelper.getRootDir('cic-cms');
    });

    this.Given(/^I have done `meteor install`$/, function () {
        // return this.FileHelper.checkDirExist('/app/.meteor', baseRepo);
        let output = this.ShellHelper.run('meteor --version');
    });

    this.When(/^I do `meteor test`$/, function () {
        this.ShellHelper.run('cd ' + baseRepo + '/app/');
    });

    this.Then(/^the mocha tests should run$/, function () {
        return true;
    });

    this.Given(/^I have done `cd tests\/cucumber`$/, function () {
        this.ShellHelper.run('cd ' + baseRepo + '/app/tests/cucumber/');
    });

    this.When(/^I do `chimp —browser=phantomjs`$/, function () {
        return true;
    });

    this.Then(/^all my cucumber\.js tests should run$/, function () {
        return true;
    });


};
module.exports = function () {

    this.Given(/^I am logged in as admin$/, function () {
        const loggedUserId = browser.execute(() => {
            if(Roles.userIsInRole( Meteor.userId(), 'admin')){
                return true
            }
            Meteor.logout()
            return false
        })
        if(loggedUserId.value) {
            //console.log("User was already logged in as administrator");

        } else {
            browser.url(`${this.baseUrl}/`);
            browser.waitForExist('.submit-login', 5000);

            const administrator = fixtures.users.administrator;
            browser.execute((administrator) => {
                Meteor.loginWithPassword(administrator.username,administrator.password)
            },administrator);


            browser.waitUntil(() => {
                const id = browser.execute(() => Meteor.userId())
                return !!id.value
            }, 10000);
        }

    });

    this.Given(/^I am logged in as presenter$/, function () {
        const presenter = fixtures.users.presenter;

        const loggedUserId = browser.execute(() => {
            if(Roles.userIsInRole( Meteor.userId(), 'presenter')){
                return true
            }
            Meteor.logout()
            return false
        })
        if(loggedUserId.value) {
            //console.log("User was already logged in as presenter");
        } else {//console.log(`Presenter=>`,presenter);
            browser.url(`${this.baseUrl}/`);
            browser.waitForExist('.submit-login', 5000);

            browser.execute((presenter) => {
                Meteor.loginWithPassword(presenter.username, presenter.password)
            }, presenter);

            browser.waitUntil(() => {
                const id = browser.execute(() => Meteor.userId())
                return !!id.value
            }, 10000);
        }
    });

};
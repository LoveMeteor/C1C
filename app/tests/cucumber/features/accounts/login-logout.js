module.exports = function () {
    this.Given(/^I am not logged in$/, () => {
        browser.execute(() => {
            Meteor.logout()
        });

        browser.waitUntil(() => {
            const id = browser.execute(() => Meteor.userId());
            return id.value == null
        }, 10000);
    });

    this.Given(/^I am on login page$/, function () {
        this.subUrl = "login";
        browser.url(`${this.baseUrl}/${this.subUrl}`)
        browser.waitForExist('.submit-login', 5000)
    });

    this.Given(/^I am logged in as an admin$/, function () {
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

            const administrator = fixtures.users.administrator; //console.log("administrator", administrator, administrator.username, administrator.password);
            browser.execute((administrator) => {
                Meteor.loginWithPassword(administrator.username,administrator.password)
            },administrator);


            browser.waitUntil(() => {
                const id = browser.execute(() => Meteor.userId())
                return !!id.value
            }, 10000);
        }

        browser.url(this.baseUrl);
        browser.waitUntil(() => {
            const url = browser.getUrl()
            return url.indexOf('engagements')>-1
        }, 5000)
    });

    this.Given(/^I am logged in as a presenter$/, function () {
        const presenter = fixtures.users.presenter;

        const loggedUserId = browser.execute(() => {
            if(Roles.userIsInRole( Meteor.userId(), 'presenter')){
                return true
            }
            Meteor.logout()
            return false
        })
        if(loggedUserId.value) {
            // console.log("User was already logged in as presenter");
        } else {
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

        browser.url(this.baseUrl);

        browser.waitUntil(() => {
            const url = browser.getUrl()
            return url.indexOf('presenter')>-1
        }, 5000)
    });

    this.When(/^I log in as an administrator$/, () => {

        browser.waitForExist('a.submit-login', 5000);

        const administrator = fixtures.users.administrator;

        browser.setValue('input[placeholder="Email or Username"]', administrator.username);
        browser.setValue('input[placeholder="Password"]', administrator.password);

        browser.click('a.submit-login.enabled');
    });


    this.Then(/^I should see the engagement page$/, () => {
        browser.waitUntil(() => {
            const url = browser.getUrl()
            return url.indexOf('engagements')>-1
        }, 5000)
        browser.waitForExist('div=Engagements', 5000);
    });

    this.When(/^I click on Account button$/, function () {
        browser.url(`${this.baseUrl}`);

        browser.waitForExist('a[href="/account/"]', 5000);
        browser.click('a[href="/account/"]');
    });

    this.When(/^I click on Sign out button$/, () => {
        const url = browser.getUrl();
        let selector;
        if(url.indexOf('account')>-1) {
            selector = 'div=Sign out';
        } else if(url.indexOf('presenter')>-1) {
            selector = 'svg.action-icon-exit';
        }

        browser.waitForExist(selector, 10000);
        browser.click(selector);
    });

    this.Then(/^I should be redirected to the login page$/, () => {
        browser.waitUntil(() => {
            const url = browser.getUrl()
            return url.indexOf('login')>-1
        }, 5000)
    });

    this.When(/^I log in as a presenter$/, () => {
        browser.waitForExist('a.submit-login', 5000);

        const presenter = fixtures.users.presenter;

        browser.setValue('input[placeholder="Email or Username"]', presenter.username);
        browser.setValue('input[placeholder="Password"]', presenter.password);

        browser.click('a.submit-login.enabled');
    });

    this.Then(/^I should see the presenter page$/, () => {
        browser.waitUntil(() => {
            const url = browser.getUrl()
            return url.indexOf('presenter')>-1
        }, 5000)
    });

}
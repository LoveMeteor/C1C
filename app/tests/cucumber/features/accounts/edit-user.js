const _ = require('underscore')
const faker = require('faker')

module.exports = function () {
    this.Given(/^I am viewing user list$/, function () {
        this.subUrl = 'account';
        browser.url(`${this.baseUrl}/${this.subUrl}`);

        const users = fixtures.getUsers({}, {sort:{username:1}});
        const userIds = _.pluck(users, '_id');
        const selector = '.list-users .item-user'
        browser.waitUntil(()=>{
            if(!browser.isExisting(selector)) return false

            if(browser.elements(selector).value.length != users.length) return false

            const elDataIds = [].concat(browser.getAttribute(selector, 'data-id'));
            return userIds.every((id, index) => id == elDataIds[index]);
        }, 5000)
    });

    this.When(/^I edit existing user by changing first name, last name and role$/, function () {
        const users = fixtures.getUsers({}, {sort:{username:1}})
        this.selectedUser = _.sample(_.filter(users,(user)=>user.username!='admin' && user.username!='presenter1'))

        //console.log("Sample user selector", `.list-users .item-user[data-id="${this.selectedUser._id}"] svg.action-icon-settings`)
        browser.click(`.list-users .item-user[data-id="${this.selectedUser._id}"] svg.action-icon-settings`)

        this.input = {}

        this.input.firstName = faker.name.firstName()
        browser.waitForExist('#edit-user-container input[placeholder="First Name"]', 5000)
        browser.setValue('#edit-user-container input[placeholder="First Name"]', this.input.firstName)

        this.input.lastName = faker.name.lastName()
        browser.waitForExist('#edit-user-container input[placeholder="Last Name"]', 5000)
        browser.setValue('#edit-user-container input[placeholder="Last Name"]', this.input.lastName)


        browser.click('#edit-user-container .selector-role div')
        browser.waitForExist('#edit-user-container .selector-role li', 5000)
        let liNames = browser.elements('#edit-user-container .selector-role li').getText()
        const roles = Object.entries(fixtures.getRoles()).map(([key,value]) => ({_id : key,name:value})); //console.log("Roles", roles)
        expect(liNames.length).toEqual(roles.length+1)
        expect(liNames.every((name, index)=>{
            if(index == 0) {
                return name === 'Reset'
            } else {
                const role = roles[index-1].name
                return name === role
            }
        })).toEqual(true)

        browser.click(`#edit-user-container .selector-role li:first-child`)
        browser.click('#edit-user-container .selector-role div');
        browser.waitForExist('#edit-user-container .selector-role li', 5000)

        let index = _.random(0, roles.length-1)
        this.input.role = roles[index];
        browser.click(`#edit-user-container .selector-role li:nth-child(${index+1})`)

        browser.waitForExist('#edit-user-container .btn-continue.enabled', 5000)
        browser.click('#edit-user-container .btn-continue.enabled', 5000)
    });

    this.Then(/^I should see the user with updated data$/, function () {
        const input = this.input
        const selectedUser = this.selectedUser

        const users = fixtures.getUsers({}, {sort:{name:1}});
        const selector = `.list-users .item-user[data-id="${selectedUser._id}"]`
        browser.waitUntil(()=>{
            if(!browser.isExisting(selector)) return false
            //console.log(browser.getText(`${selector} .display-role-name`))
            return browser.getText(`${selector} .display-role-name`) == input.role.name
        }, 5000)
    });

    this.When(/^I delete an user$/, function () {
        const users = fixtures.getUsers()
        const sampleUser = _.sample(_.filter(users,(user)=>user.username!='admin' && user.username!='presenter1'))

        this.selectedUserId = sampleUser._id

        browser.click(`.list-users .item-user[data-id="${sampleUser._id}"] svg.action-icon-remove`)
        const btnElDel = browser.element('div=Yes\, delete it');
        btnElDel.waitForExist(500);
        btnElDel.scroll();
        btnElDel.click();

    });

    this.Then(/^I shouldn't see this user in list$/, function () {
        const selectedUserId = this.selectedUserId;

        browser.waitUntil(function(){
            const userElIds = browser.getAttribute('.list-users .item-user', 'data-id');

            return !_.contains(userElIds, selectedUserId);
        }, 3000)
    });
}

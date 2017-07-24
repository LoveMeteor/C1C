/**
 * Created by jaross on 28/10/16.
 */
module.exports = function () {

    // Scenario: Admin should add contact person information for each engagement

    this.When(/^I enter customer name, email and phone number$/, function () {
        client.element(selectors.engagement.detail.customerName).setValue("New Customer");
        client.element(selectors.engagement.detail.email).setValue("new@customer.com");
        client.element(selectors.engagement.detail.phone).setValue("1111000000");
        client.click(selectors.engagement.detail.btnSave);
    });

    this.Then(/^I should see his information in engagement details page$/, function () {
        expect(client.element(selectors.engagement.detail.customerName).getValue()).toEqual("New Customer");
        expect(client.element(selectors.engagement.detail.email).getValue()).toEqual("new@customer.com");
        expect(client.element(selectors.engagement.detail.phone).getValue()).toEqual("1111000000");
    });

    // Scenario: Admin should list engagement team members

    this.When(/^I select engagement members$/, function () {
        client.click(selectors.engagement.detail.members.viewLink);
    });

    this.Then(/^I should see list of all engagement members names and emails$/, function () {
        client.elements(selectors.engagement.detail.members.section).waitForExist(3000);
        expect(client.getHTML(selectors.engagement.detail.members.memberItem).length).toEqual(3);
    });

    // Scenario: Admin should add team members to a engagement by adding fullname and email

    this.When(/^I add engagement member by entering email and name$/, function () {
        client.element(selectors.engagement.detail.members.add.memberName).setValue("New Member");
        client.element(selectors.engagement.detail.members.add.email).setValue("new@member.com");
        client.click(selectors.engagement.detail.members.add.btnAddMember);
    });

    this.Then(/^I should see his name in the engagement members list$/, function () {
        const members = client.getHTML(selectors.engagement.detail.members.memberItemNew);
        expect(members.length).toBeGreaterThan(1);
    });

    // Scenario: Admin should send email with assets attached to members of a engagement

    this.When(/^I choose to send email to engagement members$/, function () {
        client.click(selectors.engagement.detail.members.memberItem);
    });

    this.When(/^enter email body and signature$/, function () {
        client.element(selectors.engagement.detail.sendmail.mailBody).setValue("Hello members!");
        client.click(selectors.engagement.detail.sendmail.btnSendMail);
    });

    this.Then(/^engagement members should receive email with the entered body and with all related assets attached$/, function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
    });
}
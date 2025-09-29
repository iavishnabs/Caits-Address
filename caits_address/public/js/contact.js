frappe.ui.form.on('Contact', {
    refresh: function (frm) {
        if (!frm.doc.__islocal) {
            if (frappe.user.has_role('System Manager')) {
                if (frm.doc.links) {
                    const customer_list = [];
                    $.each(frm.doc.links, function (idx, link) {
                        if (link.link_doctype == "Customer") {
                            customer_list.push(link.link_name);
                        }
                    });
                    if (customer_list.length > 0) {
                        if (frm.doc.email_id && !frm.doc.user) {
                            frm.add_custom_button(__('Create User'), function () {
                                frappe.call({
                                    method: "caits_address.events.contact.create_user_from_contact",
                                    args: {
                                        contact: frm.doc.name,
                                    },
                                    callback: function (r) {
                                        // handle response
                                    }
                                });
                            });
                        }

                        if (frm.doc.email_id && frm.doc.user) {
                            frm.add_custom_button(__('Set User Permission'), function () {
                                let d = new frappe.ui.Dialog({
                                    title: "Select Customer",
                                    fields: [
                                        {
                                            label: "Customer",
                                            fieldname: "customer",
                                            fieldtype: "Link",
                                            options: "Customer",
                                            get_query: function () {
                                                return {
                                                    filters: {
                                                        name: ["in", customer_list]
                                                    }
                                                };
                                            }
                                        }
                                    ],
                                    size: "small",
                                    primary_action_label: "Set",
                                    primary_action(values) {
                                        if (values.customer)
                                            frappe.call({
                                                method: "caits_address.events.contact.set_user_permission_from_contact",
                                                args: {
                                                    customer: values.customer,
                                                    email: frm.doc.email_id
                                                },
                                                callback: function (r) {

                                                }
                                            })
                                        d.hide();
                                    }
                                });
                                d.show();
                            });
                        }
                    }
                }
            }
        }
    }
});

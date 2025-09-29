frappe.ui.form.on("Address", {
    // onload: function (frm) {
    //     if (frm.doc.links) {
    //         $.each(frm.doc.links, function (idx, data) {
    //             if (data.link_doctype == "Customer") {
    //                 frappe.db.get_value("Customer", data.link_name, 'tax_category')
    //                     .then(r => {
    //                         let values = r.message;
    //                         if (values) {
    //                             frm.set_value("tax_category", values.tax_category)
    //                         }
    //                     })
    //             }
    //         })
    //     }
    // },
    onload:function(frm){
        handle_customer_tax_category(frm)
    },

    validate: function (frm) {
        handle_customer_tax_category(frm)
    },

    pincode: function (frm) {
        frm.clear_table("custom_iwapp_pincode_details")
        frm.refresh_fields("custom_iwapp_pincode_details");
        if (frm.doc.country == "India" && frm.doc.pincode) {
            frappe.db.exists('Iwapp Pincode', frm.doc.pincode)
                .then(exists => {
                    if (exists) {
                        frappe.db.get_doc('Iwapp Pincode', frm.doc.pincode)
                            .then(doc => {
                                if (doc.pincode_details) {
                                    $.each(doc.pincode_details, function (i, pin) {
                                        frm.set_value({ "state": pin.state, "custom_taluk": pin.taluk, "county": pin.district })
                                    })
                                    let d = new frappe.ui.Dialog({
                                        title: 'Select Your Post Office',
                                        fields: [
                                            {
                                                label: 'Post Office',
                                                fieldname: 'post',
                                                fieldtype: 'Select',
                                                options: doc.pincode_details.map(pin => pin.post_office)
                                            }
                                        ],
                                        size: 'small', // small, large, extra-large
                                        primary_action_label: 'Save',
                                        primary_action(values) {
                                            frm.set_value("custom_post_office", values.post)

                                            d.hide();
                                        }
                                    });
                                    d.show();
                                }
                                else {
                                    frm.set_value({ "state": "", "custom_taluk": "", "county": "", "custom_post_office": "" })
                                }
                            })
                    }
                    else {
                        frappe.call({
                            method: 'iwapp_address.events.address.pincode',
                            args: {
                                pin: frm.doc.pincode
                            },
                            callback: function (r) {
                                if (r.message) {
                                    frm.clear_table("custom_iwapp_pincode_details")
                                    $.each(r.message, function (i, pin) {
                                        frm.set_value({ "state": pin.State, "custom_taluk": pin.Block, "county": pin.District })
                                        var child = cur_frm.add_child("custom_iwapp_pincode_details");
                                        child.post_office = pin.Name
                                        child.taluk = pin.Block
                                        child.division = pin.Division
                                        child.district = pin.District
                                        child.state = pin.State
                                        frm.refresh_fields("custom_iwapp_pincode_details");
                                    })
                                    let d = new frappe.ui.Dialog({
                                        title: 'Select Your Post Office',
                                        fields: [
                                            {
                                                label: 'Post Office',
                                                fieldname: 'post',
                                                fieldtype: 'Select',
                                                options: r.message.map(pin => pin.Name)
                                                // here pin is iterating on each pin.Name(.map() looping post ofice)                                         }

                                            }
                                        ],
                                        size: 'small', // small, large, extra-large
                                        primary_action_label: 'Save',
                                        primary_action(values) {
                                            frm.set_value("custom_post_office", values.post)

                                            d.hide();
                                        }
                                    });
                                    d.show();
                                }
                                else {
                                    frm.set_value({ "state": "", "custom_taluk": "", "county": "", "custom_post_office": "" })
                                }
                            }
                        })
                    }
                })
        }
    },
})

function handle_customer_tax_category(frm){
    if (frm.doc.is_primary_address == 1 || frm.doc.is_shipping_address == 1) {
        if (frm.doc.links) {
            $.each(frm.doc.links, function (idx, link) {
                if (link.link_doctype == "Customer") {
                    frappe.db.get_value('Customer', link.link_name, 'tax_category')
                        .then(r => {
                            let customer_tax_category = r.message.tax_category;
                            if (frm.doc.tax_category == "Out-State" && customer_tax_category == "In-State") {
                                frappe.confirm(
                                    'The Customer Tax category is <b>In-state</b>, is this address <b>Out-State</b> ?',
                                    function () {
                                        // Yes action: change check fields to "0" and save
                                        frm.set_value('is_primary_address', 0);
                                        frm.set_value('is_shipping_address', 0);
                                        frm.save();
                                    },
                                    function () {
                                        // No action: change the Tax category to "In-state"
                                        frm.set_value('tax_category', "In-State");
                                        frm.save();
                                    }
                                );
                            }
                        });
                }
            });
        }
    }
}
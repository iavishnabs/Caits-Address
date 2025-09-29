import frappe

def before_save(doc, method):
    if doc.first_name and doc.middle_name and doc.last_name:
        doc.custom_full_name = f"{doc.first_name} {doc.middle_name} {doc.last_name}"
    elif doc.first_name and doc.last_name:
        doc.custom_full_name = f"{doc.first_name} {doc.last_name}"
    elif doc.first_name and doc.middle_name:
        doc.custom_full_name = f"{doc.first_name} {doc.middle_name}"
    else:
        doc.custom_full_name = doc.first_name

@frappe.whitelist()
def create_user_from_contact(contact):
    contact_doc = frappe.get_doc("Contact", contact)
    if contact_doc:
        user = frappe.new_doc("User")
        user.update({
            "first_name": contact_doc.first_name,
            "middle_name": contact_doc.middle_name or "",
            "last_name": contact_doc.last_name or "",
            "email": contact_doc.email_id,
            "role_profile_name": "Customer",
            "user_type": "Website User",
            "mobile_no": contact_doc.phone or ""
        })
        user.save()
        for link in contact_doc.links:
            if link.link_doctype == "Customer":
                create_user_permission(contact_doc.email_id, link.link_name, is_default=1)
                frappe.msgprint("<b>User and User Permission is Created for Customer.</b>")

@frappe.whitelist()
def set_user_permission_from_contact(customer, email):
    if customer and email:
        create_user_permission(email, customer, is_default=0)
        frappe.msgprint(f"<b>User Permission</b> assigned for <b>Customer {customer}.</b>")

def create_user_permission(email, customer, is_default):
    user_perm = frappe.new_doc("User Permission")
    user_perm.update({
        "user": email,
        "allow": "Customer",
        "for_value": customer,
        "is_default": is_default
    })
    user_perm.save()

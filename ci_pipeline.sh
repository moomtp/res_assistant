# TODO: implement on staging_host
ansible-playbook -i ansible/inventory/staging_host.yml ansible/ansible-playbooks/deploy_service.yml
# TODO: test on staging_host
python3 test/test_res_assi.py 10.123.250.15

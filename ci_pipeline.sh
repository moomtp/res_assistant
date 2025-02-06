# TODO: implement on staging_host
ansible-playbook -i ansible/inventory/staging_host.yml ansible/playbooks/deploy_service.yml --roles-path=ansible/roles
# TODO: test on staging_host's master node
python3 test/test_res_assi.py 10.123.250.15

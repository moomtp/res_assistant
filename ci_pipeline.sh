# implement on staging_host
cd ansible
ansible-playbook -i inventory/staging_host.yml playbooks/deploy_service.yml
# test on staging_host's master node
cd ..
python3 test/test_res_assi.py 10.123.250.15
